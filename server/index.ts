/**
 * Боевой сервер API: принимает /api/* от nginx и вызывает обработчики
 * из api/ (те же, что в `npm run dev`). Статику сайта и /uploads/ отдаёт
 * nginx, сюда приходят только запросы к API.
 *
 * Сборка: npm run build:server → dist-server/index.js
 * Запуск: node dist-server/index.js (на сервере — systemd, deploy/ykt-sokol.service)
 *   PORT (3000), HOST (127.0.0.1) — где слушать; снаружи порт не открываем.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import * as request from '../api/request';
import * as login from '../api/admin/login';
import * as logout from '../api/admin/logout';
import * as publish from '../api/admin/publish';
import * as status from '../api/admin/status';
import * as upload from '../api/admin/upload';
import * as content from '../api/admin/content/[key]';

type Handler = (request: Request) => Promise<Response> | Response;
type Module = Partial<Record<string, Handler>>;

const ROUTES: Record<string, Module> = {
	'/api/request': request,
	'/api/admin/login': login,
	'/api/admin/logout': logout,
	'/api/admin/publish': publish,
	'/api/admin/status': status,
	'/api/admin/upload': upload,
};

function route(pathname: string): Module | null {
	const clean = pathname.replace(/\/+$/, '');
	if (ROUTES[clean]) return ROUTES[clean];
	if (/^\/api\/admin\/content\/[^/]+$/.test(clean)) return content;
	return null;
}

/** Больше тела не читаем: самый большой запрос — PDF до 20 МБ */
const MAX_BODY = 21 * 1024 * 1024;

async function readBody(req: IncomingMessage): Promise<Buffer | null> {
	const chunks: Buffer[] = [];
	let size = 0;
	for await (const chunk of req as AsyncIterable<Buffer>) {
		size += chunk.length;
		if (size > MAX_BODY) return null;
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}

function toHeaders(req: IncomingMessage): Headers {
	const headers = new Headers();
	for (const [k, v] of Object.entries(req.headers)) {
		if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
		else if (v !== undefined) headers.set(k, v);
	}
	return headers;
}

async function send(res: ServerResponse, response: Response) {
	res.statusCode = response.status;
	response.headers.forEach((value, key) => {
		if (key !== 'set-cookie') res.setHeader(key, value);
	});
	const cookies = response.headers.getSetCookie();
	if (cookies.length) res.setHeader('set-cookie', cookies);
	res.end(Buffer.from(await response.arrayBuffer()));
}

function plain(res: ServerResponse, code: number, body: Record<string, unknown>) {
	res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
	res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
	if (url.pathname === '/api/health') return plain(res, 200, { ok: true });

	const mod = route(url.pathname);
	if (!mod) return plain(res, 404, { error: 'Not found' });
	const method = req.method ?? 'GET';
	const handler = mod[method];
	if (typeof handler !== 'function') return plain(res, 405, { error: 'Method Not Allowed' });

	try {
		let body: Uint8Array<ArrayBuffer> | undefined;
		if (method !== 'GET' && method !== 'HEAD') {
			const read = await readBody(req);
			if (!read) return plain(res, 413, { error: 'Слишком большой запрос' });
			body = new Uint8Array(read);
		}
		// Схема и хост — как их видит посетитель (nginx передаёт X-Forwarded-Proto и Host)
		const proto = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
		const full = `${proto}://${req.headers.host ?? 'localhost'}${req.url ?? '/'}`;
		await send(res, await handler(new Request(full, { method, headers: toHeaders(req), body })));
	} catch (e) {
		console.error('api_error', url.pathname, e instanceof Error ? e.stack : e);
		if (!res.headersSent) plain(res, 500, { error: 'Ошибка сервера' });
		else res.end();
	}
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
server.requestTimeout = 120_000;
server.listen(port, host, () => console.log(`api: http://${host}:${port}`));

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
	process.on(signal, () => {
		server.close(() => process.exit(0));
		setTimeout(() => process.exit(0), 5000).unref();
	});
}
