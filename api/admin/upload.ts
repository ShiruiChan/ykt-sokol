/**
 * POST /api/admin/upload — выдаёт браузеру одноразовый токен на загрузку
 * файла прямо в Vercel Blob (файл не идёт через функцию, лимит тела
 * функции в 4,5 МБ не мешает). Тип и размер ограничены в самом токене:
 *   фото — JPEG/PNG/WebP до 15 МБ, документы — PDF до 20 МБ.
 * Колбэк о завершении загрузки не нужен: адрес файла админка получает
 * сразу и сохраняет вместе с разделом.
 */
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdmin } from '../_lib/auth.js';
import { fail, json, readJson, sameOrigin } from '../_lib/http.js';

const MB = 1024 * 1024;

const UPLOAD_RULES = {
	image: { types: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 15 * MB, prefix: 'images/', ext: /\.(jpe?g|png|webp)$/ },
	pdf: { types: ['application/pdf'], maxBytes: 20 * MB, prefix: 'documents/', ext: /\.pdf$/ },
} as const;

const PATH_RE = /^(images|documents)\/[a-z0-9][a-z0-9._-]{0,120}$/;

export async function POST(request: Request): Promise<Response> {
	if (!sameOrigin(request)) return fail(403, 'Запрос с чужого сайта');
	const denied = requireAdmin(request);
	if (denied) return denied;
	if (!process.env.BLOB_READ_WRITE_TOKEN) {
		return fail(503, 'Хранилище файлов не настроено: подключите Vercel Blob (BLOB_READ_WRITE_TOKEN).');
	}

	const body = (await readJson(request, 10_000)) as HandleUploadBody | null;
	if (!body || body.type !== 'blob.generate-client-token') return fail(400, 'Неверный запрос');

	try {
		const result = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname, clientPayload) => {
				const rule = clientPayload === 'pdf' ? UPLOAD_RULES.pdf : clientPayload === 'image' ? UPLOAD_RULES.image : null;
				if (!rule || !PATH_RE.test(pathname) || !pathname.startsWith(rule.prefix) || !rule.ext.test(pathname)) {
					throw new Error('bad_upload');
				}
				return {
					allowedContentTypes: [...rule.types],
					maximumSizeInBytes: rule.maxBytes,
					addRandomSuffix: true,
				};
			},
		});
		return json(200, result);
	} catch (e) {
		if (e instanceof Error && e.message === 'bad_upload') {
			return fail(400, 'Можно загружать только JPEG, PNG, WebP или PDF');
		}
		return fail(502, 'Не удалось подготовить загрузку файла');
	}
}
