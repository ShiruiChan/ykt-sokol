/**
 * POST /api/admin/upload?kind=image|pdf&name=<имя-латиницей> — сохраняет
 * фото или PDF на диск сервера (UPLOADS_DIR) и возвращает его адрес
 * /uploads/images/… или /uploads/documents/…
 *
 * Тело запроса — сам файл (не multipart). Тип проверяется и по заголовку,
 * и по первым байтам файла: переименованный .exe за картинку не пройдёт.
 *   фото — JPEG/PNG/WebP до 15 МБ, документы — PDF до 20 МБ.
 */
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin } from '../_lib/auth.js';
import { fail, json, sameOrigin } from '../_lib/http.js';
import { UPLOADS_URL_PREFIX, uploadsDir } from '../_lib/uploads.js';

const MB = 1024 * 1024;

const UPLOAD_RULES = {
	image: { dir: 'images', maxBytes: 15 * MB },
	pdf: { dir: 'documents', maxBytes: 20 * MB },
} as const;

/** Тип файла по сигнатуре — заголовку от браузера не верим */
function sniff(b: Uint8Array): { type: string; ext: string } | null {
	const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
	if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
	if (b[0] === 0x89 && ascii(1, 4) === 'PNG') return { type: 'image/png', ext: 'png' };
	if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp' };
	if (ascii(0, 5) === '%PDF-') return { type: 'application/pdf', ext: 'pdf' };
	return null;
}

/** Тело целиком, но не больше max байт. null — больше лимита */
async function readCapped(request: Request, max: number): Promise<Uint8Array | null> {
	if (Number(request.headers.get('content-length') || 0) > max) return null;
	if (!request.body) return new Uint8Array();
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		size += value.byteLength;
		if (size > max) {
			await reader.cancel().catch(() => {});
			return null;
		}
		chunks.push(value);
	}
	const out = new Uint8Array(size);
	let offset = 0;
	for (const c of chunks) {
		out.set(c, offset);
		offset += c.byteLength;
	}
	return out;
}

export async function POST(request: Request): Promise<Response> {
	if (!sameOrigin(request)) return fail(403, 'Запрос с чужого сайта');
	const denied = requireAdmin(request);
	if (denied) return denied;

	const root = uploadsDir();
	if (!root) return fail(503, 'Хранилище файлов не настроено: задайте UPLOADS_DIR на сервере (см. deploy/README.md).');

	const params = new URL(request.url).searchParams;
	const kind = params.get('kind');
	const rule = kind === 'image' ? UPLOAD_RULES.image : kind === 'pdf' ? UPLOAD_RULES.pdf : null;
	if (!rule) return fail(400, 'Можно загружать только JPEG, PNG, WebP или PDF');

	const body = await readCapped(request, rule.maxBytes);
	if (!body) return fail(413, kind === 'pdf' ? 'PDF больше 20 МБ' : 'Фото больше 15 МБ');
	if (!body.byteLength) return fail(400, 'Пустой файл');

	const detected = sniff(body);
	const allowed = kind === 'pdf' ? detected?.ext === 'pdf' : detected && detected.ext !== 'pdf';
	if (!detected || !allowed) return fail(400, 'Можно загружать только JPEG, PNG, WebP или PDF');

	// Имя — только латиница, цифры и дефис; случайный хвост исключает перезапись чужого файла
	const base = (params.get('name') ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'file';
	const fileName = `${base}-${randomBytes(4).toString('hex')}.${detected.ext}`;
	const dir = path.join(root, rule.dir);

	try {
		await mkdir(dir, { recursive: true });
		await writeFile(path.join(dir, fileName), body, { flag: 'wx' });
	} catch (e) {
		console.error('upload_write_failed', e instanceof Error ? e.message : 'unknown');
		return fail(500, 'Не удалось сохранить файл на сервере');
	}

	return json(200, { url: `${UPLOADS_URL_PREFIX}${rule.dir}/${fileName}`, contentType: detected.type, size: body.byteLength });
}
