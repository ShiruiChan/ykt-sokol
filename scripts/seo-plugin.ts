/**
 * Vite-плагин статического SEO.
 *
 * Сайт: SPA, и без JS поисковик видит пустой <div id="root">. Плагин после
 * сборки кладёт рядом с index.html отдельный HTML на каждый маршрут
 * (/product/1.html и т. д.) со своими title, description, canonical,
 * Open Graph, Schema.org и коротким текстом страницы внутри #root.
 * React при старте заменяет этот текст живым приложением.
 * Заодно генерирует sitemap.xml из того же списка страниц.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { absUrl, allPages, BRAND, DEFAULT_IMAGE, homeMeta, SITE_URL, type PageMeta } from '../src/seo';

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// data-react-helmet: Helmet считает эти теги своими и заменяет их при навигации, без дублей
function headHtml(m: PageMeta) {
	const url = absUrl(m.path);
	const tags = [
		`<title>${esc(m.title)}</title>`,
		`<meta name="description" content="${esc(m.description)}" data-react-helmet="true" />`,
		m.noindex
			? `<meta name="robots" content="noindex, follow" data-react-helmet="true" />`
			: `<link rel="canonical" href="${url}" data-react-helmet="true" />`,
		`<meta property="og:type" content="${m.type === 'product' ? 'product' : 'website'}" data-react-helmet="true" />`,
		`<meta property="og:site_name" content="${BRAND}" data-react-helmet="true" />`,
		`<meta property="og:locale" content="ru_RU" data-react-helmet="true" />`,
		`<meta property="og:title" content="${esc(m.title)}" data-react-helmet="true" />`,
		`<meta property="og:description" content="${esc(m.description)}" data-react-helmet="true" />`,
		`<meta property="og:url" content="${url}" data-react-helmet="true" />`,
		`<meta property="og:image" content="${absUrl(m.image ?? DEFAULT_IMAGE)}" data-react-helmet="true" />`,
		`<meta name="twitter:card" content="summary_large_image" data-react-helmet="true" />`,
		...(m.jsonLd ?? []).map(
			(ld) =>
				`<script type="application/ld+json" data-react-helmet="true">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`
		),
	];
	return tags.join('\n    ');
}

// Текст для поисковика и для первых миллисекунд до загрузки JS
function bodyHtml(m: PageMeta) {
	if (!m.h1) return '';
	const nav = allPages()
		.map((p) => `<li><a href="${p.path}">${esc(p.h1 ?? p.title)}</a></li>`)
		.join('');
	return `<div class="seo-static"><h1>${esc(m.h1)}</h1>${m.lede ? `<p>${esc(m.lede)}</p>` : ''}<p>${esc(m.description)}</p><p><a href="tel:+79969141414">+7 (996) 914-14-14</a></p><nav><ul>${nav}</ul></nav></div>`;
}

const fill = (html: string, m: PageMeta) =>
	html
		.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, `<!--seo-->\n    ${headHtml(m)}\n    <!--/seo-->`)
		.replace(/<!--app-->[\s\S]*?<!--\/app-->/, `<!--app-->${bodyHtml(m)}<!--/app-->`);

export default function seoPlugin(): Plugin {
	let outDir = 'dist';

	return {
		name: 'sokol-static-seo',
		configResolved(config) {
			outDir = path.resolve(config.root, config.build.outDir);
		},
		// Главная (и dev-сервер) получают мета-теги прямо в index.html
		transformIndexHtml(html) {
			return fill(html, homeMeta);
		},
		closeBundle() {
			const indexPath = path.join(outDir, 'index.html');
			if (!fs.existsSync(indexPath)) return;
			const template = fs.readFileSync(indexPath, 'utf8');
			const pages = allPages();

			for (const page of pages) {
				if (page.path === '/') continue;
				// /product/1 → product/1.html (Vercel отдаёт его по чистому URL благодаря cleanUrls)
				const file = path.join(outDir, `${page.path}.html`);
				fs.mkdirSync(path.dirname(file), { recursive: true });
				fs.writeFileSync(file, fill(template, page));
			}

			const today = new Date().toISOString().slice(0, 10);
			const priority = (p: string) =>
				p === '/' ? '1.0' : p.startsWith('/product/') ? '0.9' : p === '/gallery' ? '0.6' : '0.5';
			const urls = pages
				.map(
					(p) =>
						`  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority(p.path)}</priority>\n  </url>`
				)
				.join('\n');
			fs.writeFileSync(
				path.join(outDir, 'sitemap.xml'),
				`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
			);
		},
	};
}
