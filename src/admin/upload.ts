/**
 * Загрузка фото и PDF на свой сервер: /api/admin/upload (только после входа)
 * сохраняет файл в UPLOADS_DIR и возвращает адрес /uploads/…
 *
 * Фото перед загрузкой ужимаются до 2000 px по длинной стороне и
 * перекодируются в WebP: снимок с телефона на 8 МБ превращается в ~300 КБ.
 */
const MB = 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 15 * MB;
export const MAX_PDF_BYTES = 20 * MB;
const MAX_SIDE = 2000;

/** «Фото ЛИС 01.JPG» → «foto-lis-01» — имя файла латиницей для адреса */
const TRANSLIT: Record<string, string> = {
	а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k',
	л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
	ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(text: string): string {
	return Array.from(text.toLowerCase(), (ch) => TRANSLIT[ch] ?? ch)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 60);
}

const baseName = (file: File) => slugify(file.name.replace(/\.[^.]+$/, '')) || 'file';

async function compressImage(file: File): Promise<Blob> {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
	const w = Math.round(bitmap.width * scale);
	const h = Math.round(bitmap.height * scale);
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('canvas');
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();
	const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
	// Браузер без кодировщика WebP вернёт PNG — тогда отправляем оригинал, если он не крупнее
	if (!blob || blob.type !== 'image/webp') return file;
	return blob.size < file.size || file.type !== 'image/webp' ? blob : file;
}

export class UploadError extends Error {}

/** Проверка до загрузки — понятная ошибка без похода на сервер */
export function checkFile(file: File, kind: 'image' | 'pdf'): string | null {
	if (kind === 'image') {
		if (!IMAGE_TYPES.includes(file.type)) return `«${file.name}»: подходят только JPEG, PNG и WebP`;
		if (file.size > MAX_IMAGE_BYTES) return `«${file.name}»: фото больше 15 МБ`;
	} else {
		if (file.type !== 'application/pdf') return `«${file.name}»: нужен PDF`;
		if (file.size > MAX_PDF_BYTES) return `«${file.name}»: PDF больше 20 МБ`;
	}
	return null;
}

/** Отправка файла на сервер с прогрессом (fetch прогресс отправки не отдаёт) */
function send(url: string, body: Blob, contentType: string, onProgress?: (percent: number) => void): Promise<string> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', url);
		xhr.setRequestHeader('content-type', contentType);
		xhr.responseType = 'json';
		if (onProgress) xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
		xhr.onload = () => {
			const data = (xhr.response ?? {}) as { url?: string; error?: string };
			if (xhr.status === 200 && data.url) resolve(data.url);
			else reject(new UploadError(data.error || 'Не удалось загрузить файл. Попробуйте ещё раз.'));
		};
		xhr.onerror = () => reject(new UploadError('Не удалось загрузить файл. Проверьте интернет и попробуйте ещё раз.'));
		xhr.send(body);
	});
}

/** Загружает файл на сервер и возвращает его постоянный адрес /uploads/… */
export async function uploadFile(
	file: File,
	kind: 'image' | 'pdf',
	onProgress?: (percent: number) => void
): Promise<string> {
	const problem = checkFile(file, kind);
	if (problem) throw new UploadError(problem);

	let body: Blob = file;
	if (kind === 'image') {
		try {
			body = await compressImage(file);
		} catch {
			body = file;
		}
	}

	const query = new URLSearchParams({ kind, name: baseName(file) });
	return send(`/api/admin/upload?${query}`, body, body.type || file.type, onProgress);
}
