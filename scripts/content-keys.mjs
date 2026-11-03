/**
 * Общие для скриптов content-* и db-* константы и минимальная проверка
 * формы данных. Полная проверка схемы — в src/admin/schema.ts на сервере:
 * в БД попадает только то, что её прошло. Здесь лишь страховка сборки
 * от совсем битых данных.
 */
import path from 'node:path';

export const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
export const CONTENT_DIR = path.join(ROOT, 'content');
export const CONTENT_KEYS = ['products', 'faq', 'news', 'documents', 'site'];

const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);

/** Ошибка формы или null */
export function shapeError(key, data) {
	if (key === 'site') {
		if (!isObj(data) || !isObj(data.phones) || !isObj(data.address) || !isObj(data.hours) || !isObj(data.messengers)) {
			return 'ожидается объект с phones, address, hours, messengers';
		}
		return null;
	}
	if (!Array.isArray(data)) return 'ожидается список';
	if (key === 'products') {
		if (!data.length) return 'нет ни одной модели';
		const bad = data.find((p) => !isObj(p) || typeof p.slug !== 'string' || typeof p.price !== 'number' || !Array.isArray(p.images));
		if (bad) return 'у модели нет slug, цены или списка фото';
	}
	return null;
}
