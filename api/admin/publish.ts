/**
 * POST /api/admin/publish — запускает пересборку сайта на Vercel через
 * Deploy Hook (VERCEL_DEPLOY_HOOK_URL). Сборка сама подтянет свежие данные
 * из БД (scripts/pull-content.mjs) и через ~1 минуту сайт обновится.
 * Адрес хука — секрет: в ответы и логи он не попадает.
 */
import { requireAdmin } from '../_lib/auth.js';
import { fail, json, sameOrigin } from '../_lib/http.js';
import { getStore } from '../_lib/store.js';

export async function POST(request: Request): Promise<Response> {
	if (!sameOrigin(request)) return fail(403, 'Запрос с чужого сайта');
	const denied = requireAdmin(request);
	if (denied) return denied;

	const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
	if (!hook) {
		return fail(503, 'Публикация не настроена: задайте VERCEL_DEPLOY_HOOK_URL в настройках проекта Vercel.', {
			code: 'publish_not_configured',
		});
	}

	try {
		const res = await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(10_000) });
		if (!res.ok) return fail(502, `Vercel не принял запрос на публикацию (код ${res.status}). Попробуйте ещё раз.`);
	} catch {
		return fail(502, 'Не удалось связаться с Vercel. Попробуйте ещё раз через минуту.');
	}

	try {
		await getStore()?.audit('publish', null);
	} catch {
		/* сборка уже запущена — журнал не критичен */
	}
	return json(200, { ok: true, publishedAt: new Date().toISOString() });
}
