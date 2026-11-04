/**
 * Мета-данные страниц в одном месте. Из этого модуля их берут и клиент
 * (компонент <Seo /> обновляет <head> при переходах), и пререндер
 * (scripts/prerender.mjs вшивает их в статический HTML для поисковиков).
 */
import { products, productBySlug, productPath } from '../data/products';
import type { Product } from '../types';
import { FAQ } from '../data/faq';
import { ADDRESS, BRAND, HOURS, PHONE, SITE_URL, absoluteUrl } from '../config/site';

export interface PageMeta {
	title: string;
	description: string;
	/** Путь страницы — из него строится canonical и og:url */
	path: string;
	/** Абсолютный или корневой путь к картинке для соцсетей */
	image?: string;
	type?: 'website' | 'product';
	noindex?: boolean;
	jsonLd?: Record<string, unknown>[];
}

const DEFAULT_IMAGE = '/images/pickup-1.8/1.webp';

const ORGANIZATION = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	'@id': `${SITE_URL}/#org`,
	name: BRAND,
	url: absoluteUrl('/'),
	logo: absoluteUrl('/logo.webp'),
	telephone: PHONE.label,
	address: {
		'@type': 'PostalAddress',
		streetAddress: ADDRESS.street,
		addressLocality: 'Якутск',
		addressRegion: 'Республика Саха (Якутия)',
		addressCountry: 'RU',
	},
};

const LOCAL_BUSINESS = {
	'@context': 'https://schema.org',
	'@type': 'AutomotiveBusiness',
	name: `${BRAND} — производство снегоболотоходов`,
	url: absoluteUrl('/'),
	image: absoluteUrl(DEFAULT_IMAGE),
	telephone: PHONE.label,
	address: ORGANIZATION.address,
	openingHoursSpecification: {
		'@type': 'OpeningHoursSpecification',
		dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
		opens: HOURS.opens,
		closes: HOURS.closes,
	},
	parentOrganization: { '@id': ORGANIZATION['@id'] },
};

function productJsonLd(p: Product) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: p.name,
		description: p.deskSmall,
		category: 'Снегоболотоход',
		brand: { '@type': 'Brand', name: BRAND },
		manufacturer: { '@id': ORGANIZATION['@id'] },
		image: p.images.map((src) => absoluteUrl(src)),
		url: absoluteUrl(productPath(p)),
		offers: {
			'@type': 'Offer',
			price: p.price,
			priceCurrency: 'RUB',
			availability: 'https://schema.org/InStock',
			url: absoluteUrl(productPath(p)),
			seller: { '@id': ORGANIZATION['@id'] },
		},
	};
}

/** Страницы с постоянным адресом. Сюда же смотрит генератор sitemap. */
export const STATIC_PAGES: Record<string, Omit<PageMeta, 'path'>> = {
	'/': {
		title: 'ЯКТСокол | Снегоболотоходы производства Якутск',
		description:
			'ЯКТСокол — производство снегоболотоходов в Якутске. Надёжная вездеходная техника для охоты, рыбалки, бизнеса и путешествий по бездорожью, снегу и болотам.',
		jsonLd: [ORGANIZATION, LOCAL_BUSINESS],
	},
	'/compare': {
		title: `Сравнение моделей снегоболотоходов — ${BRAND}`,
		description:
			'Сравните модели снегоболотоходов ЯКТСокол: клиренс, двигатель, число мест, скорость на плаву и цена — в одной таблице.',
	},
	'/service': {
		title: `Как купить вездеход — ${BRAND}`,
		description:
			'Как купить вездеход ЯКТСокол: разговор с менеджером, предоплата 50 000 ₽ после согласования комплектации, доставка по Якутии и России, гарантия и документы.',
		jsonLd: [
			{
				'@context': 'https://schema.org',
				'@type': 'FAQPage',
				mainEntity: FAQ.map((f) => ({
					'@type': 'Question',
					name: f.q,
					acceptedAnswer: { '@type': 'Answer', text: f.a },
				})),
			},
		],
	},
	'/news': {
		title: `Новости — ${BRAND}`,
		description:
			'Новости производства снегоболотоходов ЯКТСокол в Якутске: поставки, испытания, награды и упоминания в прессе.',
	},
	'/gallery': {
		title: `Галерея — снегоболотоходы ${BRAND}`,
		description:
			'Фотографии снегоболотоходов ЯКТСокол: производство в Якутске, испытания на бездорожье, снегу и воде.',
	},
	'/cert': {
		title: `Документы и сертификаты — ${BRAND}`,
		description:
			'Сертификаты соответствия ЕАЭС на снегоболотоходы ЯКТСокол и двигатели, патент на раму снегоболотохода.',
	},
	'/privacy': {
		title: `Политика обработки персональных данных — ${BRAND}`,
		description: 'Как ЯКТСокол собирает, хранит и использует персональные данные посетителей сайта.',
	},
};

/**
 * Служебные страницы: пререндерятся (чтобы адрес отдавал 200, а не 404),
 * но закрыты от индексации и в sitemap не попадают.
 */
export const NOINDEX_PAGES: Record<string, Omit<PageMeta, 'path'>> = {
	'/kp': {
		title: `Коммерческое предложение — ${BRAND}`,
		description: 'Коммерческое предложение по выбранной комплектации снегоболотохода.',
		noindex: true,
	},
};

const NOT_FOUND: Omit<PageMeta, 'path'> = {
	title: `Страница не найдена — ${BRAND}`,
	description: 'Такой страницы нет. Перейдите в каталог моделей или свяжитесь с нами.',
	noindex: true,
};

export function productMeta(p: Product): PageMeta {
	return {
		title: `${p.name} — снегоболотоход, цена ${p.price.toLocaleString('ru-RU')} ₽ | ${BRAND}`,
		description: p.deskSmall,
		path: productPath(p),
		image: p.images[0] ?? DEFAULT_IMAGE,
		type: 'product',
		jsonLd: [productJsonLd(p)],
	};
}

/** Мета для любого адреса сайта. Неизвестный адрес — страница 404 с noindex. */
export function getMeta(pathname: string): PageMeta {
	const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

	const page = STATIC_PAGES[path];
	if (page) return { ...page, path };

	const service = NOINDEX_PAGES[path];
	if (service) return { ...service, path };

	const model = path.match(/^\/models\/([^/]+)$/);
	if (model) {
		const product = productBySlug(model[1]);
		if (product) return productMeta(product);
	}

	return { ...NOT_FOUND, path };
}

/** Все адреса, которые надо пререндерить и положить в sitemap. */
export const ALL_PATHS = [...Object.keys(STATIC_PAGES), ...products.map(productPath)];

/** Адреса, которые пререндерятся, но не входят в sitemap (noindex). */
export const NOINDEX_PATHS = Object.keys(NOINDEX_PAGES);

export { DEFAULT_IMAGE };
