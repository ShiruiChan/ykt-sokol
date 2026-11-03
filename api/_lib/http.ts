/**
 * Общие помощники для функций /api/admin/*. Файлы в api/_lib Vercel
 * не превращает в отдельные функции (имя начинается с «_»).
 */

export const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex, nofollow',
			...headers,
		},
	});

export const fail = (status: number, error: string, extra: Record<string, unknown> = {}) =>
	json(status, { error, ...extra });

/** Тело запроса как JSON с верхней границей размера. null — тело битое или слишком большое */
export async function readJson(request: Request, maxBytes: number): Promise<unknown | null> {
	const type = request.headers.get('content-type') ?? '';
	if (!type.includes('application/json')) return null;
	const declared = Number(request.headers.get('content-length') ?? 0);
	if (declared > maxBytes) return null;
	const raw = await request.text();
	if (raw.length > maxBytes) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/**
 * Изменяющие запросы принимаем только со своего сайта. Cookie и так
 * SameSite=Strict — это второй рубеж против CSRF.
 */
export function sameOrigin(request: Request): boolean {
	const origin = request.headers.get('origin');
	if (!origin) return true; // не браузер или тот же источник без Origin
	const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
	try {
		return new URL(origin).host === host;
	} catch {
		return false;
	}
}

export function clientIp(request: Request): string {
	const fwd = request.headers.get('x-forwarded-for');
	return (fwd ? fwd.split(',')[0] : request.headers.get('x-real-ip') ?? '').trim() || 'unknown';
}
