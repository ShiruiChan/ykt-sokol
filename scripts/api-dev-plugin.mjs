/**
 * Локальный запуск функций из api/ внутри `npm run dev` — без `vercel dev`
 * и без логина в Vercel. Обработчики (export GET/POST/PUT) грузятся через
 * Vite, поэтому TypeScript и правки подхватываются на лету.
 *
 * Переменные окружения берутся из .env.local / .env (как у Vite, но все,
 * не только VITE_*) и попадают только в серверную часть, не в бандл.
 * Без DATABASE_URL включается файловый адаптер (ADMIN_CONTENT_STORE=file):
 * админка читает и пишет content/*.json прямо в рабочей копии.
 * На Vercel этот плагин не работает — там только настоящие функции.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';

/** URL → файл функции. Повторяет маршрутизацию Vercel для наших путей */
function resolveHandler(root, pathname) {
	const clean = pathname.replace(/\/+$/, '');
	if (!clean.startsWith('/api/')) return null;
	const direct = path.join(root, `${clean}.ts`);
	if (existsSync(direct)) return direct;
	const dynamic = clean.match(/^\/api\/admin\/content\/[^/]+$/);
	if (dynamic) return path.join(root, 'api/admin/content/[key].ts');
	return null;
}

async function toRequest(req) {
	const url = `http://${req.headers.host ?? 'localhost'}${req.url}`;
	const headers = new Headers();
	for (const [k, v] of Object.entries(req.headers)) {
		if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
		else if (v !== undefined) headers.set(k, v);
	}
	let body;
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		const chunks = [];
		for await (const c of req) chunks.push(c);
		body = Buffer.concat(chunks);
	}
	return new Request(url, { method: req.method, headers, body });
}

async function sendResponse(res, response) {
	res.statusCode = response.status;
	response.headers.forEach((value, key) => {
		if (key !== 'set-cookie') res.setHeader(key, value);
	});
	const cookies = response.headers.getSetCookie?.() ?? [];
	if (cookies.length) res.setHeader('set-cookie', cookies);
	res.end(Buffer.from(await response.arrayBuffer()));
}

export function prepareDevEnv(mode, root) {
	const env = loadEnv(mode, root, '');
	for (const [k, v] of Object.entries(env)) {
		if (process.env[k] === undefined) process.env[k] = v;
	}
	if (!process.env.DATABASE_URL && !process.env.ADMIN_CONTENT_STORE) {
		process.env.ADMIN_CONTENT_STORE = 'file';
	}
}

export default function apiDevPlugin() {
	let root = process.cwd();
	return {
		name: 'ykt-api-dev',
		apply: 'serve',
		configResolved(config) {
			root = config.root;
			prepareDevEnv(config.mode, root);
		},
		configureServer(server) {
			const store = process.env.DATABASE_URL
				? 'Postgres (DATABASE_URL)'
				: `файлы ${process.env.ADMIN_CONTENT_ROOT || '.'}/content/*.json`;
			server.config.logger.info(`  ➜  Админка: /admin, данные — ${store}`);

			server.middlewares.use(async (req, res, next) => {
				const pathname = (req.url ?? '/').split('?')[0];

				// /admin — отдельная страница admin.html (на Vercel так делает cleanUrls)
				if (pathname === '/admin' || pathname === '/admin/') {
					req.url = '/admin.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
					return next();
				}

				const file = resolveHandler(root, pathname);
				if (!file) return next();
				try {
					const mod = await server.ssrLoadModule(file);
					const handler = mod[req.method ?? 'GET'];
					if (typeof handler !== 'function') {
						res.statusCode = 405;
						return res.end('Method Not Allowed');
					}
					await sendResponse(res, await handler(await toRequest(req)));
				} catch (e) {
					server.config.logger.error(`[api] ${pathname}: ${e?.stack ?? e}`);
					res.statusCode = 500;
					res.setHeader('content-type', 'application/json; charset=utf-8');
					res.end(JSON.stringify({ error: 'Ошибка функции (см. терминал)' }));
				}
			});
		},
	};
}
