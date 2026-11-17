/**
 * GET /api/admin/status — вошёл ли владелец и что с публикацией:
 * когда последний раз сохраняли и публиковали, настроены ли БД,
 * хранилище файлов и команда публикации. Значения переменных не отдаются —
 * только признак «задана / не задана».
 */
import { authConfigured, isAuthenticated } from '../_lib/auth.js';
import { json } from '../_lib/http.js';
import { getStore } from '../_lib/store.js';
import { uploadsDir } from '../_lib/uploads.js';

export async function GET(request: Request): Promise<Response> {
	if (!authConfigured()) {
		return json(200, { authenticated: false, authConfigured: false });
	}
	if (!isAuthenticated(request)) return json(200, { authenticated: false, authConfigured: true });

	const store = getStore();
	let lastSaveAt: string | null = null;
	let lastPublishAt: string | null = null;
	let storeError: string | null = null;
	if (store) {
		try {
			[lastSaveAt, lastPublishAt] = await Promise.all([store.lastAt('save'), store.lastAt('publish')]);
		} catch {
			storeError = 'База данных недоступна';
		}
	}
	return json(200, {
		authenticated: true,
		authConfigured: true,
		store: store?.kind ?? null,
		storeError,
		publishConfigured: Boolean(process.env.PUBLISH_COMMAND),
		uploadsConfigured: Boolean(uploadsDir()),
		lastSaveAt,
		lastPublishAt,
		unpublished: Boolean(lastSaveAt && (!lastPublishAt || lastSaveAt > lastPublishAt)),
	});
}
