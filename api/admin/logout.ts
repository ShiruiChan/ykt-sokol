/** POST /api/admin/logout — стирает cookie сессии */
import { clearSessionCookie } from '../_lib/auth.js';
import { json, sameOrigin, fail } from '../_lib/http.js';

export async function POST(request: Request): Promise<Response> {
	if (!sameOrigin(request)) return fail(403, 'Запрос с чужого сайта');
	return json(200, { ok: true }, { 'set-cookie': clearSessionCookie() });
}
