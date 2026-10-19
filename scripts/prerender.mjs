#!/usr/bin/env node
/**
 * Пререндер: после клиентской и серверной сборки превращает каждую
 * страницу сайта в готовый HTML с правильными <title>, description,
 * canonical, Open Graph и JSON-LD. Заодно пишет sitemap.xml и
 * robots.txt из того же списка адресов — они больше не расходятся с сайтом.
 *
 * Запуск: npm run build (вызывается автоматически).
 */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DIST = path.join(ROOT, 'dist');
const SSR_DIR = path.join(ROOT, 'dist-ssr');

const { render, ALL_PATHS, getMeta, SITE_URL } = await import(
	pathToFileURL(path.join(SSR_DIR, 'entry-server.js')).href
);

const template = await readFile(path.join(DIST, 'index.html'), 'utf8');

const esc = (s) =>
	String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const abs = (p) => (p.startsWith('http') ? p : `${SITE_URL}${p === '/' ? '/' : p}`);

/** Мета-теги страницы — те же, что выставляет клиентский <Seo /> */
function headFor(meta) {
	const url = abs(meta.path);
	const image = abs(meta.image ?? '/images/pickup-1.8/1.webp');
	const tags = [
		`<title>${esc(meta.title)}</title>`,
		`<meta name="description" content="${esc(meta.description)}" />`,
		`<meta name="robots" content="${meta.noindex ? 'noindex, follow' : 'index, follow'}" />`,
		meta.noindex ? '' : `<link rel="canonical" href="${esc(url)}" />`,
		`<meta property="og:title" content="${esc(meta.title)}" />`,
		`<meta property="og:description" content="${esc(meta.description)}" />`,
		`<meta property="og:url" content="${esc(url)}" />`,
		`<meta property="og:type" content="${meta.type === 'product' ? 'product' : 'website'}" />`,
		`<meta property="og:image" content="${esc(image)}" />`,
		`<meta property="og:locale" content="ru_RU" />`,
		`<meta property="og:site_name" content="ЯКТ СОКОЛ" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		...(meta.jsonLd ?? []).map(
			(d) =>
				`<script type="application/ld+json" data-seo-jsonld>${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`
		),
	];
	return tags.filter(Boolean).join('\n    ');
}

/** Убрать из шаблона всё, что пререндер выставляет сам, чтобы не было дублей */
function stripHead(html) {
	return html
		.replace(/<title>[\s\S]*?<\/title>\s*/i, '')
		.replace(/<meta\s+name="(description|keywords|robots|twitter:[^"]+)"[^>]*>\s*/gi, '')
		.replace(/<meta\s+property="og:[^"]+"[^>]*>\s*/gi, '')
		.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
		.replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>\s*/gi, '');
}

const base = stripHead(template);

async function renderPage(url, file) {
	const meta = getMeta(url);
	const appHtml = await render(url);
	const html = base
		.replace('</head>', `    ${headFor(meta)}\n  </head>`)
		.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
	const out = path.join(DIST, file);
	await mkdir(path.dirname(out), { recursive: true });
	await writeFile(out, html);
	console.log(`✔ ${url.padEnd(28)} → dist/${file}`);
}

for (const url of ALL_PATHS) {
	// cleanUrls в vercel.json: /gallery отдаётся из gallery.html
	await renderPage(url, url === '/' ? 'index.html' : `${url.slice(1)}.html`);
}
// Любой неизвестный адрес → настоящая 404 с noindex
await renderPage('/404', '404.html');

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ALL_PATHS.map(
	(p) => `  <url>
    <loc>${abs(p)}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p === '/' ? '1.0' : p.startsWith('/models/') ? '0.9' : '0.6'}</priority>
  </url>`
).join('\n')}
</urlset>
`;
await writeFile(path.join(DIST, 'sitemap.xml'), sitemap);
await writeFile(
	path.join(DIST, 'robots.txt'),
	`User-agent: *\nAllow: /\nDisallow: /api/\n\nHost: ${SITE_URL}\nSitemap: ${SITE_URL}/sitemap.xml\n`
);
console.log(`✔ sitemap.xml (${ALL_PATHS.length} адресов), robots.txt`);

await rm(SSR_DIR, { recursive: true, force: true });
