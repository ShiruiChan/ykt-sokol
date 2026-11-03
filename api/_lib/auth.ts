/**
 * Вход в админку: один пароль владельца (ADMIN_PASSWORD) и подписанная
 * cookie сессии. В cookie — только срок действия и HMAC-подпись
 * (ADMIN_SESSION_SECRET), никаких данных, которые надо прятать.
 * Секреты живут только в переменных окружения Vercel и в бандл не попадают.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { fail } from './http.js';

export const SESSION_COOKIE = 'ykt_admin';
export const SESSION_TTL_SEC = 7 * 24 * 60 * 60;
/** Cookie уходит только на API админки */
const COOKIE_PATH = '/api/admin';

/** Не больше 5 неудачных попыток за 15 минут с одного адреса */
export const LOGIN_MAX_FAILS = 5;
export const LOGIN_WINDOW_SEC = 15 * 60;

function secret(): string | null {
	const s = process.env.ADMIN_SESSION_SECRET ?? '';
	return s.length >= 32 ? s : null;
}

/** Вход возможен, только если заданы и пароль, и достаточно длинный секрет */
export const authConfigured = () => Boolean(process.env.ADMIN_PASSWORD) && secret() !== null;

const sign = (payload: string, key: string) => createHmac('sha256', key).update(payload).digest('base64url');

function safeEqual(a: string, b: string): boolean {
	// Хэшируем обе стороны: сравнение идёт по равной длине и не выдаёт длину пароля
	const ha = createHash('sha256').update(a).digest();
	const hb = createHash('sha256').update(b).digest();
	return timingSafeEqual(ha, hb);
}

export function checkPassword(candidate: string): boolean {
	const expected = process.env.ADMIN_PASSWORD;
	if (!expected) return false;
	return safeEqual(candidate, expected);
}

export function createSessionCookie(now = Date.now()): string {
	const key = secret();
	if (!key) throw new Error('ADMIN_SESSION_SECRET не задан');
	const exp = Math.floor(now / 1000) + SESSION_TTL_SEC;
	const payload = `v1.${exp}`;
	const value = `${payload}.${sign(payload, key)}`;
	return `${SESSION_COOKIE}=${value}; Path=${COOKIE_PATH}; Max-Age=${SESSION_TTL_SEC}; HttpOnly; Secure; SameSite=Strict`;
}

export const clearSessionCookie = () =>
	`${SESSION_COOKIE}=; Path=${COOKIE_PATH}; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;

function readCookie(request: Request, name: string): string | null {
	const header = request.headers.get('cookie');
	if (!header) return null;
	for (const part of header.split(';')) {
		const [k, ...rest] = part.trim().split('=');
		if (k === name) return rest.join('=');
	}
	return null;
}

export function isAuthenticated(request: Request, now = Date.now()): boolean {
	const key = secret();
	if (!key || !process.env.ADMIN_PASSWORD) return false;
	const value = readCookie(request, SESSION_COOKIE);
	if (!value) return false;
	const parts = value.split('.');
	if (parts.length !== 3 || parts[0] !== 'v1') return false;
	const [v, exp, sig] = parts;
	if (!safeEqual(sig, sign(`${v}.${exp}`, key))) return false;
	return Number(exp) * 1000 > now;
}

/** null — можно продолжать; иначе готовый ответ 401/503 */
export function requireAdmin(request: Request): Response | null {
	if (!authConfigured()) return fail(503, 'Вход в админку не настроен: задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET');
	if (!isAuthenticated(request)) return fail(401, 'Нужно войти');
	return null;
}

/** Обезличенный отпечаток IP для лимита попыток: сам адрес нигде не хранится */
export function ipFingerprint(ip: string): string {
	const key = secret() ?? 'no-secret';
	return `ip:${createHmac('sha256', key).update(ip).digest('base64url').slice(0, 22)}`;
}
