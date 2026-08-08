#!/usr/bin/env node
/**
 * Optimizes images under public/images and public/gallery:
 * - Resizes to a max width of 1920px (keeps aspect ratio, never upscales).
 * - Converts jpg/jpeg/png/avif to WebP (quality ~72, effort 4-5).
 * - Replaces the original file with the new .webp file (old file removed).
 *
 * Run with: npm run optimize:images
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const TARGET_DIRS = ["public/images", "public/gallery"];
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 72;
const WEBP_EFFORT = 5;
const CONVERTIBLE_EXT = new Set([".jpg", ".jpeg", ".png", ".avif"]);

let converted = 0;
let skipped = 0;
let bytesBefore = 0;
let bytesAfter = 0;

async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			await walk(fullPath);
		} else if (entry.isFile()) {
			await processFile(fullPath);
		}
	}
}

async function processFile(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	if (!CONVERTIBLE_EXT.has(ext)) {
		return;
	}

	const outPath = filePath.slice(0, -ext.length) + ".webp";
	if (outPath === filePath) return;

	try {
		const before = await stat(filePath);
		bytesBefore += before.size;

		const image = sharp(filePath, { failOn: "none" });
		const metadata = await image.metadata();

		const pipeline = image.resize({
			width: MAX_WIDTH,
			withoutEnlargement: true,
		});

		await pipeline
			.webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
			.toFile(outPath);

		const after = await stat(outPath);
		bytesAfter += after.size;

		// Remove the original file if the conversion produced a different file.
		await unlink(filePath);

		converted++;
		const w = metadata.width ?? "?";
		const h = metadata.height ?? "?";
		console.log(
			`✔ ${path.relative(ROOT, filePath)} (${w}x${h}, ${(before.size / 1024).toFixed(0)} KB) -> ${path.relative(ROOT, outPath)} (${(after.size / 1024).toFixed(0)} KB)`
		);
	} catch (err) {
		skipped++;
		console.error(`✘ Failed to convert ${filePath}:`, err.message);
	}
}

async function main() {
	for (const dir of TARGET_DIRS) {
		const abs = path.join(ROOT, dir);
		try {
			await stat(abs);
		} catch {
			console.warn(`Skipping missing directory: ${dir}`);
			continue;
		}
		await walk(abs);
	}

	console.log("\n--- Summary ---");
	console.log(`Converted: ${converted} file(s)`);
	if (skipped) console.log(`Skipped/failed: ${skipped} file(s)`);
	console.log(
		`Size before: ${(bytesBefore / 1024 / 1024).toFixed(2)} MB, after: ${(bytesAfter / 1024 / 1024).toFixed(2)} MB`
	);
	if (bytesBefore > 0) {
		const reduction = 100 - (bytesAfter / bytesBefore) * 100;
		console.log(`Reduction: ${reduction.toFixed(1)}%`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
