/**
 * GET /api/admin/content/:key — раздел содержимого из БД.
 *   data: null — в БД раздела ещё нет (не выполнен сид); админка тогда
 *   показывает текущий снимок сайта и создаст запись при сохранении.
 * PUT /api/admin/content/:key — { data, version? } → проверка схемы и запись.
 *   version — что админка загрузила; если с тех пор раздел сохранили
 *   из другой вкладки, ответ 409, чтобы не затереть чужие правки.
 */
import { requireAdmin } from '../../_lib/auth.js';
import { fail, json, readJson, sameOrigin } from '../../_lib/http.js';
import { getStore } from '../../_lib/store.js';
import { isContentKey, validateContent } from '../../../src/admin/schema.js';

/** Все модели с аксессуарами — десятки КБ; 1 МБ — с большим запасом */
const MAX_BODY = 1_000_000;

function keyFrom(request: Request): string {
	const parts = new URL(request.url).pathname.split('/').filter(Boolean);
	return decodeURIComponent(parts[parts.length - 1] ?? '');
}

export async function GET(request: Request): Promise<Response> {
	const denied = requireAdmin(request);
	if (denied) return denied;
	const key = keyFrom(request);
	if (!isContentKey(key)) return fail(404, 'Нет такого раздела');

	const store = getStore();
	if (!store) return fail(503, 'База данных не настроена: задайте DATABASE_URL');
	try {
		const row = await store.get(key);
		return json(200, { key, data: row?.data ?? null, version: row?.version ?? null });
	} catch {
		return fail(503, 'База данных недоступна. Попробуйте ещё раз через минуту.');
	}
}

export async function PUT(request: Request): Promise<Response> {
	if (!sameOrigin(request)) return fail(403, 'Запрос с чужого сайта');
	const denied = requireAdmin(request);
	if (denied) return denied;
	const key = keyFrom(request);
	if (!isContentKey(key)) return fail(404, 'Нет такого раздела');

	const body = (await readJson(request, MAX_BODY)) as { data?: unknown; version?: unknown } | null;
	if (!body || typeof body !== 'object') return fail(400, 'Ожидается JSON { data }');

	const result = validateContent(key, body.data);
	if (!result.ok) return fail(422, 'Данные не прошли проверку', { errors: result.errors });

	const store = getStore();
	if (!store) return fail(503, 'База данных не настроена: задайте DATABASE_URL');
	try {
		if (typeof body.version === 'string') {
			const current = await store.get(key);
			if (current && current.version !== body.version) {
				return fail(409, 'Раздел уже сохранили в другой вкладке. Обновите страницу, чтобы не затереть те правки.');
			}
		}
		const version = await store.put(key, result.data);
		await store.audit('save', key);
		return json(200, { ok: true, key, version, data: result.data });
	} catch {
		return fail(503, 'Не удалось сохранить: база данных недоступна. Попробуйте ещё раз.');
	}
}
