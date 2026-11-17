#!/usr/bin/env node
/**
 * Локальный харнесс админки: тот же API, что на сервере, но через Vite.
 *
 *   node scripts/admin-dev.mjs          — сайт + /admin + функции api/* на http://localhost:5173
 *                                         (то же, что `npm run dev`; данные — content/*.json,
 *                                         если не задан DATABASE_URL)
 *   node scripts/admin-dev.mjs --check  — самопроверка API (npm run admin:check):
 *                                         поднимает dev-сервер на копии content/ во временной
 *                                         папке с одноразовым паролем и прогоняет сценарии:
 *                                         вход, чтение/запись, проверки схемы, публикация.
 *                                         Рабочую копию не меняет, сеть наружу не нужна.
 */
import { existsSync } from 'node:fs';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer as createNetServer } from 'node:net';
import { randomBytes } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { ROOT } from './content-keys.mjs';

const check = process.argv.includes('--check');

function freePort() {
	return new Promise((resolve) => {
		const srv = createNetServer();
		srv.listen(0, '127.0.0.1', () => {
			const { port } = srv.address();
			srv.close(() => resolve(port));
		});
	});
}

if (!check) {
	const { createServer } = await import('vite');
	const server = await createServer({ root: ROOT, server: { port: 5173 } });
	await server.listen();
	server.printUrls();
	const url = server.resolvedUrls?.local[0] ?? 'http://localhost:5173/';
	console.log(`  ➜  Админка: ${url}admin (пароль — ADMIN_PASSWORD из .env.local)`);
} else {
	await runChecks();
}

async function runChecks() {
	const tmp = await mkdtemp(path.join(os.tmpdir(), 'ykt-admin-check-'));
	await cp(path.join(ROOT, 'content'), path.join(tmp, 'content'), { recursive: true });

	const password = randomBytes(12).toString('base64url');
	Object.assign(process.env, {
		ADMIN_CONTENT_STORE: 'file',
		ADMIN_CONTENT_ROOT: tmp,
		ADMIN_PASSWORD: password,
		ADMIN_SESSION_SECRET: randomBytes(32).toString('base64url'),
	});
	for (const k of ['DATABASE_URL', 'PUBLISH_COMMAND', 'UPLOADS_DIR']) delete process.env[k];

	const { createServer } = await import('vite');
	const port = await freePort();
	const server = await createServer({
		root: ROOT,
		logLevel: 'warn',
		server: { port, strictPort: true, host: '127.0.0.1', hmr: false, watch: null },
	});
	await server.listen();
	const base = `http://127.0.0.1:${port}`;

	let failed = 0;
	const ok = (cond, name, extra = '') => {
		if (cond) console.log(`  ✔ ${name}`);
		else {
			failed++;
			console.log(`  ✖ ${name} ${extra}`);
		}
	};
	const req = async (method, url, { body, cookie, headers = {} } = {}) => {
		const res = await fetch(base + url, {
			method,
			headers: {
				...(body !== undefined ? { 'content-type': 'application/json' } : {}),
				...(cookie ? { cookie } : {}),
				...headers,
			},
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});
		const data = await res.json().catch(() => null);
		return { status: res.status, data, headers: res.headers };
	};

	try {
		console.log(`Проверка API админки (${base}, данные — копия content/ в ${tmp})\n`);

		console.log('Вход');
		let r = await req('GET', '/api/admin/status');
		ok(r.status === 200 && r.data.authenticated === false && r.data.authConfigured === true, 'без cookie — не вошёл');
		r = await req('GET', '/api/admin/content/products');
		ok(r.status === 401, 'чтение без входа → 401', `(${r.status})`);
		r = await req('POST', '/api/admin/login', { body: { password: 'wrong-password' } });
		ok(r.status === 401 && r.data.error === 'Неверный пароль', 'неверный пароль → 401', `(${r.status})`);
		ok(!r.headers.get('set-cookie'), 'неверный пароль — cookie не выдаётся');
		r = await req('POST', '/api/admin/login', { body: { password } });
		const setCookie = r.headers.get('set-cookie') ?? '';
		ok(r.status === 200, 'верный пароль → 200', `(${r.status})`);
		ok(/HttpOnly/.test(setCookie) && /Secure/.test(setCookie) && /SameSite=Strict/.test(setCookie), 'cookie: HttpOnly, Secure, SameSite=Strict');
		ok(/Max-Age=604800/.test(setCookie) && /Path=\/api\/admin/.test(setCookie), 'cookie: 7 дней, только для /api/admin');
		ok(!setCookie.includes(password), 'пароль в cookie не попадает');
		const cookie = setCookie.split(';')[0];
		r = await req('GET', '/api/admin/status', { cookie });
		ok(r.data.authenticated === true && r.data.store === 'file', 'с cookie — вошёл, файловый адаптер');
		const forged = cookie.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'));
		r = await req('GET', '/api/admin/content/faq', { cookie: forged });
		ok(r.status === 401, 'подделанная подпись cookie → 401', `(${r.status})`);
		const expired = 'ykt_admin=v1.1000000000.' + cookie.split('.').pop();
		r = await req('GET', '/api/admin/content/faq', { cookie: expired });
		ok(r.status === 401, 'чужой срок в cookie → 401', `(${r.status})`);

		console.log('\nЧтение и запись');
		r = await req('GET', '/api/admin/content/products', { cookie });
		ok(r.status === 200 && Array.isArray(r.data.data) && r.data.data.length >= 5, `модели прочитаны (${r.data?.data?.length})`);
		const products = r.data.data;
		r = await req('GET', '/api/admin/content/unknown', { cookie });
		ok(r.status === 404, 'неизвестный раздел → 404');

		const broken = structuredClone(products);
		broken[0].price = '1 660 000 руб';
		broken[1].slug = 'Пикап 1.8';
		broken[2].slug = broken[3].slug;
		r = await req('PUT', '/api/admin/content/products', { cookie, body: { data: broken } });
		const paths = (r.data?.errors ?? []).map((e) => e.path);
		ok(r.status === 422, 'битые данные → 422', `(${r.status})`);
		ok(paths.includes('products[0].price'), 'цена-строка отклонена');
		ok(paths.includes('products[1].slug'), 'slug кириллицей отклонён');
		ok(paths.includes('products[2].slug') || paths.includes('products[3].slug'), 'повторяющийся slug отклонён');

		r = await req('GET', '/api/admin/content/faq', { cookie });
		const faq = r.data.data;
		const version = r.data.version;
		const nextFaq = [...faq, { q: '  Проверочный вопрос?  ', a: 'Проверочный ответ.', extra: 'лишнее поле' }];
		r = await req('PUT', '/api/admin/content/faq', { cookie, body: { data: nextFaq, version } });
		ok(r.status === 200, 'FAQ сохранён', `(${r.status} ${JSON.stringify(r.data)})`);
		const savedLast = r.data?.data?.at(-1);
		ok(savedLast?.q === 'Проверочный вопрос?' && !('extra' in savedLast), 'сервер обрезал пробелы и отбросил лишние поля');
		const onDisk = JSON.parse(await readFile(path.join(tmp, 'content', 'faq.json'), 'utf8'));
		ok(onDisk.length === faq.length + 1, 'запись дошла до content/faq.json (во временной копии)');
		r = await req('PUT', '/api/admin/content/faq', { cookie, body: { data: faq, version } });
		ok(r.status === 409, 'устаревшая версия → 409 (не затираем чужие правки)', `(${r.status})`);
		r = await req('PUT', '/api/admin/content/faq', { cookie, body: { data: faq }, headers: { origin: 'https://evil.example' } });
		ok(r.status === 403, 'запрос с чужого Origin → 403', `(${r.status})`);
		r = await req('GET', '/api/admin/status', { cookie });
		ok(r.data.unpublished === true, 'статус: «сохранено, не опубликовано»');

		console.log('\nПубликация и загрузка');
		r = await req('POST', '/api/admin/publish', { cookie, body: {} });
		ok(r.status === 503 && /PUBLISH_COMMAND/.test(r.data.error), 'без команды публикации → 503 с понятной ошибкой', `(${r.status} ${r.data?.error})`);
		console.log(`    «${r.data?.error}»`);

		const marker = path.join(tmp, 'published');
		process.env.PUBLISH_COMMAND = `touch '${marker}'`;
		r = await req('POST', '/api/admin/publish', { cookie, body: {} });
		for (let i = 0; i < 20 && !existsSync(marker); i++) await new Promise((res) => setTimeout(res, 50));
		ok(r.status === 200 && existsSync(marker), 'с PUBLISH_COMMAND → 200, команда запущена', `(${r.status})`);
		ok(!JSON.stringify(r.data).includes(marker), 'команда в ответ не попадает');
		r = await req('GET', '/api/admin/status', { cookie });
		ok(r.data.unpublished === false && r.data.publishConfigured === true, 'статус после публикации: опубликовано');
		delete process.env.PUBLISH_COMMAND;

		const upload = (query, bytes, { cookie: c = cookie, type = 'application/octet-stream' } = {}) =>
			fetch(`${base}/api/admin/upload?${query}`, {
				method: 'POST',
				headers: { 'content-type': type, ...(c ? { cookie: c } : {}) },
				body: bytes,
			}).then(async (res) => ({ status: res.status, data: await res.json().catch(() => null) }));
		const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
		r = await upload('kind=image&name=Photo%201', png, { cookie: '' });
		ok(r.status === 401, 'загрузка без входа → 401', `(${r.status})`);
		r = await upload('kind=image&name=Photo%201', png, { type: 'image/png' });
		ok(r.status === 200 && /^\/uploads\/images\/photo-1-[0-9a-f]{8}\.png$/.test(r.data?.url ?? ''), `фото сохранено: ${r.data?.url}`, `(${r.status} ${r.data?.error})`);
		const saved = r.data?.url ? path.join(tmp, '.admin-dev', r.data.url) : '';
		ok(saved && existsSync(saved), 'файл лежит в папке загрузок');
		const served = r.data?.url ? await fetch(base + r.data.url) : null;
		ok(served?.status === 200 && served.headers.get('content-type') === 'image/png', 'файл отдаётся по /uploads/…', `(${served?.status})`);
		r = await upload('kind=image&name=evil', Buffer.from('MZ\x90\x00 not an image'), { type: 'image/png' });
		ok(r.status === 400, 'exe под видом картинки → 400', `(${r.status})`);
		r = await upload('kind=pdf&name=doc', png, { type: 'application/pdf' });
		ok(r.status === 400, 'картинка под видом PDF → 400', `(${r.status})`);
		r = await upload('kind=exe&name=x', png);
		ok(r.status === 400, 'неизвестный тип → 400', `(${r.status})`);
		const traversal = await fetch(`${base}/uploads/..%2F..%2Fcontent%2Fsite.json`);
		ok(traversal.status === 404, 'выход из папки загрузок по /uploads/../ → 404', `(${traversal.status})`);

		console.log('\nЛимит попыток входа');
		const statuses = [];
		for (let i = 0; i < 5; i++) statuses.push((await req('POST', '/api/admin/login', { body: { password: `bad-${i}` } })).status);
		ok(statuses.slice(0, 4).every((s) => s === 401) && statuses[4] === 429, `5 неудачных попыток за 15 минут → 429 (${statuses.join(', ')})`);
		r = await req('POST', '/api/admin/login', { body: { password } });
		ok(r.status === 429, 'после блокировки не пускает даже с верным паролем', `(${r.status})`);

		r = await req('POST', '/api/admin/logout', { cookie, body: {} });
		ok(/Max-Age=0/.test(r.headers.get('set-cookie') ?? ''), 'выход стирает cookie');
	} finally {
		await server.close();
		await rm(tmp, { recursive: true, force: true });
	}

	console.log(failed ? `\n✖ Провалено проверок: ${failed}` : '\n✔ Все проверки пройдены');
	process.exit(failed ? 1 : 0);
}
