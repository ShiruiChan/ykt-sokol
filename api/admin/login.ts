/**
 * POST /api/admin/login — { password } → cookie сессии на 7 дней.
 * Лимит: 5 неудачных попыток за 15 минут с адреса. Счётчик живёт в БД
 * (admin_audit); если хранилища нет — в памяти функции, что на Vercel
 * лишь частичная защита: у каждого экземпляра функции свой счётчик.
 */
import {
	LOGIN_MAX_FAILS,
	LOGIN_WINDOW_SEC,
	authConfigured,
	checkPassword,
	createSessionCookie,
	ipFingerprint,
} from '../_lib/auth.js';
import { clientIp, fail, json, readJson, sameOrigin } from '../_lib/http.js';
import { getStore } from '../_lib/store.js';

const memoryFails = new Map<string, number[]>();

async function recentFails(fp: string): Promise<number> {
	const store = getStore();
	if (store) {
		try {
			return await store.countRecent('login_fail', fp, LOGIN_WINDOW_SEC);
		} catch {
			// БД недоступна — падаем на счётчик в памяти
		}
	}
	const since = Date.now() - LOGIN_WINDOW_SEC * 1000;
	const list = (memoryFails.get(fp) ?? []).filter((t) => t > since);
	memoryFails.set(fp, list);
	return list.length;
}

async function recordFail(fp: string) {
	const list = memoryFails.get(fp) ?? [];
	list.push(Date.now());
	memoryFails.set(fp, list);
	try {
		await getStore()?.audit('login_fail', fp);
	} catch {
		/* лимит в памяти уже учёл попытку */
	}
}

export async function POST(request: Request): Promise<Response> {
	if (!sameOrigin(request)) return fail(403, 'Запрос с чужого сайта');
	if (!authConfigured()) {
		return fail(503, 'Вход в админку не настроен: задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET (не короче 32 символов)');
	}

	const fp = ipFingerprint(clientIp(request));
	if ((await recentFails(fp)) >= LOGIN_MAX_FAILS) {
		return fail(429, 'Слишком много неудачных попыток. Подождите 15 минут.');
	}

	const body = (await readJson(request, 2_000)) as { password?: unknown } | null;
	const password = typeof body?.password === 'string' ? body.password : '';
	if (!password || !checkPassword(password)) {
		await recordFail(fp);
		return fail(401, 'Неверный пароль');
	}

	memoryFails.delete(fp);
	try {
		await getStore()?.audit('login', null);
	} catch {
		/* журнал — не повод не пускать */
	}
	return json(200, { ok: true }, { 'set-cookie': createSessionCookie() });
}
