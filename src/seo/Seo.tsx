import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getMeta, DEFAULT_IMAGE, type PageMeta } from './meta';
import { absoluteUrl } from '../config/site';

/** Найти тег в <head> по селектору или создать его. */
function upsert(selector: string, create: () => HTMLElement) {
	let el = document.head.querySelector<HTMLElement>(selector);
	if (!el) {
		el = create();
		document.head.appendChild(el);
	}
	return el;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
	const el = upsert(`meta[${attr}="${key}"]`, () => {
		const m = document.createElement('meta');
		m.setAttribute(attr, key);
		return m;
	});
	el.setAttribute('content', content);
}

export function applyMeta(meta: PageMeta) {
	const url = absoluteUrl(meta.path);
	const image = meta.image ?? DEFAULT_IMAGE;

	document.title = meta.title;
	setMeta('name', 'description', meta.description);
	setMeta('name', 'robots', meta.noindex ? 'noindex, follow' : 'index, follow');
	setMeta('property', 'og:title', meta.title);
	setMeta('property', 'og:description', meta.description);
	setMeta('property', 'og:url', url);
	setMeta('property', 'og:type', meta.type === 'product' ? 'product' : 'website');
	setMeta('property', 'og:image', image.startsWith('http') ? image : absoluteUrl(image));

	const canonical = upsert('link[rel="canonical"]', () => {
		const l = document.createElement('link');
		l.rel = 'canonical';
		return l;
	});
	canonical.setAttribute('href', url);

	document.head.querySelectorAll('script[data-seo-jsonld]').forEach((s) => s.remove());
	for (const data of meta.jsonLd ?? []) {
		const s = document.createElement('script');
		s.type = 'application/ld+json';
		s.dataset.seoJsonld = '';
		s.textContent = JSON.stringify(data);
		document.head.appendChild(s);
	}
}

/**
 * Держит <head> в соответствии с текущим адресом. Теги не дублируются:
 * существующие (в том числе вшитые пререндером) обновляются на месте.
 */
export default function Seo() {
	const { pathname } = useLocation();

	useEffect(() => {
		applyMeta(getMeta(pathname));
	}, [pathname]);

	return null;
}
