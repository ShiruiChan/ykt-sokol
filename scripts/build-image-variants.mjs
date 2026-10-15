#!/usr/bin/env node
/**
 * Готовит адаптивные варианты картинок и манифест размеров.
 *
 * - Галерея: «1 (N).webp» → «NN.webp» (пробелы и скобки ломают srcset),
 *   оригиналы ужимаются до 2400px по большей стороне, превью — gallery/thumb/NN-600|1200.webp.
 * - Модели: images/<модель>/N.webp → N-480|960.webp рядом, исходник не трогаем.
 * - Hero: отдельные кадры 768/1280/1920 в images/hero.
 * - Манифест src/data/image-variants.gen.ts — ширина/высота каждого исходника,
 *   чтобы задавать width/height и не ловить CLS.
 *
 * Идемпотентен: готовые варианты новее исходника пропускаются.
 * Запуск: npm run images:variants
 */
import { mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");
const PUBLIC = path.join(ROOT, "public");
const MANIFEST = path.join(ROOT, "src/data/image-variants.gen.ts");

const GALLERY_DIR = "gallery";
const GALLERY_MAX_SIDE = 2400;
const GALLERY_QUALITY = 78;
const GALLERY_THUMBS = [600, 1200];
const GALLERY_MIN_GAIN = 0.85;

const MODEL_DIRS = ["images/lis", "images/pickup-1.5", "images/pickup-1.8", "images/sokol-plus"];
const MODEL_WIDTHS = [480, 960];

// Горизонтальный кадр для широких экранов; квадратный pickup-1.8/1 остаётся для портретных
const HERO = { from: "gallery/59.webp", to: "images/hero/reeds", widths: [768, 1280, 1920] };

const VARIANT_QUALITY = 76;
// Hero лежит под плотным затемнением — артефакты сжатия не видны, а LCP легче
const HERO_QUALITY = 68;
const EFFORT = 5;
// Уже сгенерированные варианты не должны сами становиться исходниками
const VARIANT_RE = /-\d+\.webp$/;

const stats = { written: 0, skipped: 0 };

const abs = (p) => path.join(PUBLIC, p);
const url = (p) => "/" + p.split(path.sep).join("/");

async function mtime(p) {
	try {
		return (await stat(p)).mtimeMs;
	} catch {
		return 0;
	}
}

async function listWebp(dir) {
	const entries = await readdir(abs(dir), { withFileTypes: true });
	return entries
		.filter((e) => e.isFile() && e.name.endsWith(".webp") && !VARIANT_RE.test(e.name))
		.map((e) => e.name)
		.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

/** Пишет вариант шириной width, если его нет или исходник свежее */
async function variant(srcRel, outRel, width, quality = VARIANT_QUALITY) {
	const src = abs(srcRel);
	const out = abs(outRel);
	if ((await mtime(out)) > (await mtime(src))) {
		stats.skipped++;
		return;
	}
	await mkdir(path.dirname(out), { recursive: true });
	await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality, effort: EFFORT }).toFile(out);
	stats.written++;
}

/** Ширины вариантов в пределах исходника — апскейл только раздувает файл */
const fitWidths = (widths, srcWidth) => widths.filter((w) => w < srcWidth);

async function renameGallery() {
	const names = await readdir(abs(GALLERY_DIR));
	for (const name of names) {
		const m = /^1 \((\d+)\)\.webp$/.exec(name);
		if (!m) continue;
		const clean = `${m[1].padStart(2, "0")}.webp`;
		await rename(abs(path.join(GALLERY_DIR, name)), abs(path.join(GALLERY_DIR, clean)));
		console.log(`↻ ${name} → ${clean}`);
	}
}

/** Ужимает оригинал галереи; перекодируем только если файл реально станет меньше */
async function compressGalleryOriginal(rel) {
	const file = abs(rel);
	const meta = await sharp(file).metadata();
	const { width, height } = meta;
	const tooBig = Math.max(width, height) > GALLERY_MAX_SIDE;

	const before = (await stat(file)).size;
	const buf = await sharp(file)
		.resize({ width: GALLERY_MAX_SIDE, height: GALLERY_MAX_SIDE, fit: "inside", withoutEnlargement: true })
		.webp({ quality: GALLERY_QUALITY, effort: EFFORT })
		.toBuffer({ resolveWithObject: true });
	// Без ресайза берём только заметный выигрыш: повторный прогон не должен копить потери качества
	const worth = tooBig ? buf.data.length < before : buf.data.length < before * GALLERY_MIN_GAIN;
	if (worth) {
		await writeFile(file, buf.data);
		console.log(`⇣ ${rel}: ${width}×${height} ${kb(before)} → ${buf.info.width}×${buf.info.height} ${kb(buf.data.length)}`);
		return { width: buf.info.width, height: buf.info.height };
	}
	return { width, height };
}

const kb = (b) => `${Math.round(b / 1024)} KB`;

async function main() {
	/** @type {Record<string, {w: number, h: number, srcset: [string, number][]}>} */
	const images = {};
	const gallery = [];

	// Галерея
	await renameGallery();
	for (const name of await listWebp(GALLERY_DIR)) {
		const rel = path.join(GALLERY_DIR, name);
		const { width, height } = await compressGalleryOriginal(rel);
		const base = name.replace(/\.webp$/, "");
		const srcset = [];
		for (const w of fitWidths(GALLERY_THUMBS, width)) {
			const out = path.join(GALLERY_DIR, "thumb", `${base}-${w}.webp`);
			await variant(rel, out, w);
			srcset.push([url(out), w]);
		}
		srcset.push([url(rel), width]);
		images[url(rel)] = { w: width, h: height, srcset };
		gallery.push(url(rel));
	}

	// Модели
	for (const dir of MODEL_DIRS) {
		for (const name of await listWebp(dir)) {
			const rel = path.join(dir, name);
			const { width, height } = await sharp(abs(rel)).metadata();
			const base = name.replace(/\.webp$/, "");
			const srcset = [];
			for (const w of fitWidths(MODEL_WIDTHS, width)) {
				const out = path.join(dir, `${base}-${w}.webp`);
				await variant(rel, out, w);
				srcset.push([url(out), w]);
			}
			srcset.push([url(rel), width]);
			images[url(rel)] = { w: width, h: height, srcset };
		}
	}

	// Hero: последний вариант = полная ширина исходника, лёгкое перекодирование
	{
		const { width, height } = await sharp(abs(HERO.from)).metadata();
		const srcset = [];
		for (const w of HERO.widths.filter((w) => w <= width)) {
			const out = `${HERO.to}-${w}.webp`;
			await variant(HERO.from, out, w, HERO_QUALITY);
			srcset.push([url(out), w]);
		}
		const key = url(`${HERO.to}.webp`);
		images[key] = { w: width, h: height, srcset };
	}

	// Одна строка на исходник — диф манифеста остаётся читаемым
	const entries = Object.entries(images)
		.map(([k, v]) => `\t${JSON.stringify(k)}: ${JSON.stringify(v)},`)
		.join("\n");
	const body = `// Сгенерировано scripts/build-image-variants.mjs — руками не править.
export interface ImageVariants {
	/** Ширина и высота исходника — для width/height против CLS */
	w: number;
	h: number;
	/** [путь, ширина] по возрастанию; последний — самый крупный */
	srcset: [string, number][];
}

export const IMAGE_VARIANTS: Record<string, ImageVariants> = {
${entries}
};

/** Кадры галереи по порядку */
export const GALLERY: string[] = [
${gallery.map((g) => `\t${JSON.stringify(g)},`).join("\n")}
];
`;
	await writeFile(MANIFEST, body);

	console.log(`\nВариантов записано: ${stats.written}, пропущено свежих: ${stats.skipped}`);
	console.log(`Манифест: ${path.relative(ROOT, MANIFEST)} (${Object.keys(images).length} исходников)`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
