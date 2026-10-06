/**
 * Единый источник SEO-данных. Без React-зависимостей, поэтому этот же модуль
 * используется и в браузере (компонент <Seo>), и при сборке (vite.config.ts
 * пишет отдельный index.html на каждый маршрут, чтобы поисковик видел
 * правильные title, description и разметку ещё до выполнения JS).
 */
import { products } from './data/products';
import type { Product } from './types';

export const SITE_URL = 'https://ykt-sokol.vercel.app';
export const BRAND = 'ЯКТ СОКОЛ';
export const PHONE = '+7-996-914-14-14';
export const DEFAULT_IMAGE = '/images/pickup-1.8/1.webp';

export const ADDRESS = {
	streetAddress: 'ул. Чусовского, 75/3',
	addressLocality: 'Якутск',
	addressRegion: 'Республика Саха (Якутия)',
	addressCountry: 'RU',
};

export type JsonLd = Record<string, unknown>;

/** Значение характеристики, которое можно показывать поисковику (не заглушка) */
const known = (v?: string) => (v && !/разработ/i.test(v) ? v : undefined);

export interface PageMeta {
	path: string;
	title: string;
	description: string;
	image?: string;
	type?: 'website' | 'product' | 'article';
	noindex?: boolean;
	jsonLd?: JsonLd[];
	/** Короткий текст для статичной HTML-версии (видна до загрузки JS) */
	h1?: string;
	lede?: string;
}

export const absUrl = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`);

export const minPrice = Math.min(...products.map((p) => p.price));

export const formatPrice = (value: number) =>
	`${value.toLocaleString('ru-RU').replace(/ | /g, ' ')} ₽`;

/* ------------------------------ Schema.org --------------------------------- */

export const organizationLd: JsonLd = {
	'@context': 'https://schema.org',
	'@type': 'AutoDealer',
	'@id': `${SITE_URL}/#org`,
	name: BRAND,
	alternateName: 'СОКОЛ',
	url: `${SITE_URL}/`,
	logo: `${SITE_URL}/logo.webp`,
	image: absUrl(DEFAULT_IMAGE),
	description:
		'Производство снегоболотоходов СОКОЛ 4×4 в Якутске для охоты, рыбалки, работы и путешествий по бездорожью.',
	telephone: PHONE,
	priceRange: `от ${formatPrice(minPrice)}`,
	address: { '@type': 'PostalAddress', ...ADDRESS },
	areaServed: 'RU',
	openingHoursSpecification: {
		'@type': 'OpeningHoursSpecification',
		dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
		opens: '09:00',
		closes: '18:00',
	},
	sameAs: ['https://www.instagram.com/yktsokol/'],
};

const breadcrumbLd = (items: { name: string; path: string }[]): JsonLd => ({
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: items.map((item, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: item.name,
		item: absUrl(item.path),
	})),
});

export function productLd(p: Product): JsonLd {
	const ext = p.specs.extendedSpecs;
	const props: [string, string | undefined][] = [
		['Двигатель', p.specs.engine],
		['Мощность', ext?.enginePower],
		['Дорожный просвет', p.specs.clearance],
		['Коробка передач', p.specs.transmission],
		['Мест', p.specs.seats],
		['Максимальная скорость', p.specs.maxSpeed],
		['Колёсная формула', ext?.wheelFormula],
		['Шины', ext?.tires],
	];

	return {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: `Снегоболотоход ${p.name}`,
		description: p.description,
		...(p.images.length ? { image: p.images.map(absUrl) } : {}),
		brand: { '@type': 'Brand', name: BRAND },
		manufacturer: { '@id': `${SITE_URL}/#org` },
		category: 'Снегоболотоходы',
		sku: `SOKOL-${p.id}`,
		additionalProperty: props
			.filter(([, v]) => Boolean(known(v)))
			.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
		offers: {
			'@type': 'Offer',
			url: absUrl(`/product/${p.id}`),
			price: p.price,
			priceCurrency: 'RUB',
			availability: 'https://schema.org/PreOrder',
			itemCondition: 'https://schema.org/NewCondition',
			seller: { '@id': `${SITE_URL}/#org` },
		},
	};
}

/* ------------------------------- Вопросы ----------------------------------- */

/** Используется и в блоке FAQ на главной, и в разметке FAQPage */
export const FAQ: { q: string; a: string }[] = [
	{
		q: 'Сколько стоит снегоболотоход СОКОЛ?',
		a: `Цены начинаются от ${formatPrice(minPrice)} за базовую комплектацию с документами и ЗИП. Итоговая сумма зависит от модели и выбранного дооснащения: лебёдки, света, прицепа.`,
	},
	{
		q: 'Можно ли поставить технику на учёт?',
		a: 'Да. Каждая машина продаётся с электронным паспортом самоходной машины (ЭПСМ), паспортом изделия и сервисной книжкой. Техника регистрируется как самоходная машина.',
	},
	{
		q: 'Заведётся ли машина в сильный мороз?',
		a: 'Проводка, уплотнители и рабочие жидкости подобраны под якутскую зиму. Снегоболотоходы СОКОЛ работают при температуре до −50 °C.',
	},
	{
		q: 'Где брать запчасти и как ремонтировать?',
		a: 'Основные узлы от Toyota и УАЗ: запчасти есть в любом райцентре, а ремонт не требует фирменного сервиса.',
	},
	{
		q: 'Можно ли посмотреть и проехать перед покупкой?',
		a: 'Да. Приезжайте на производство в Якутске, ул. Чусовского, 75/3. Позвоните заранее, и мы подготовим нужную модель к тест-драйву.',
	},
	{
		q: 'Нужна ли предоплата и доставляете ли вы в другие регионы?',
		a: 'Предоплата не требуется до согласования комплектации и сроков. Доставляем по всей России, стоимость доставки рассчитывается отдельно.',
	},
];

const faqLd: JsonLd = {
	'@context': 'https://schema.org',
	'@type': 'FAQPage',
	mainEntity: FAQ.map((f) => ({
		'@type': 'Question',
		name: f.q,
		acceptedAnswer: { '@type': 'Answer', text: f.a },
	})),
};

/* ------------------------------- Страницы ---------------------------------- */

export const homeMeta: PageMeta = {
	path: '/',
	title: `Снегоболотоходы в Якутске от производителя, цены от ${formatPrice(minPrice)} | ${BRAND}`,
	description: `Снегоболотоходы СОКОЛ 4×4 от производителя в Якутске: клиренс до 500 мм, шины низкого давления, работа при −50 °C. ${products.length} моделей от ${formatPrice(minPrice)}, ЭПСМ, доставка по России.`,
	h1: 'Снегоболотоходы СОКОЛ от производителя в Якутске',
	lede: `Полный привод 4×4, клиренс до 500 мм, шины низкого давления. ${products.length} моделей от ${formatPrice(minPrice)} с документами для постановки на учёт.`,
	jsonLd: [
		organizationLd,
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: BRAND,
			url: `${SITE_URL}/`,
			inLanguage: 'ru',
		},
		{
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: 'Модели снегоболотоходов СОКОЛ',
			itemListElement: products.map((p, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				url: absUrl(`/product/${p.id}`),
				name: p.name,
			})),
		},
		faqLd,
	],
};

export function productMeta(p: Product): PageMeta {
	const facts = [
		known(p.specs.clearance) && `Клиренс ${p.specs.clearance}`,
		known(p.specs.seats),
		known(p.specs.maxSpeed) && `скорость ${p.specs.maxSpeed!.toLowerCase()}`,
	]
		.filter(Boolean)
		.join(', ');

	return {
		path: `/product/${p.id}`,
		title: `Снегоболотоход ${p.name}: цена ${formatPrice(p.price)}, характеристики | ${BRAND}`,
		description: `${p.name}. ${p.deskSmall} ${facts ? `${facts}. ` : ''}Цена ${formatPrice(p.price)}, производство Якутск.`,
		image: p.images[0] ?? DEFAULT_IMAGE,
		type: 'product',
		h1: `Снегоболотоход ${p.name}`,
		lede: `${p.deskSmall} Цена от ${formatPrice(p.price)}.`,
		jsonLd: [
			productLd(p),
			breadcrumbLd([
				{ name: 'Главная', path: '/' },
				{ name: p.name, path: `/product/${p.id}` },
			]),
		],
	};
}

export const newsMeta: PageMeta = {
	path: '/news',
	title: `Новости производства снегоболотоходов | ${BRAND}`,
	description:
		'Новости производства снегоболотоходов СОКОЛ в Якутске: поставки, испытания, награды и упоминания в прессе.',
	h1: 'Новости ЯКТ СОКОЛ',
};

export const galleryMeta: PageMeta = {
	path: '/gallery',
	title: `Фото снегоболотоходов СОКОЛ: цех и испытания | ${BRAND}`,
	description:
		'Фотографии снегоболотоходов СОКОЛ: производство в Якутске, испытания на бездорожье, снегу и воде.',
	h1: 'Галерея снегоболотоходов СОКОЛ',
};

export const certMeta: PageMeta = {
	path: '/cert',
	title: `Сертификаты и документы на снегоболотоходы | ${BRAND}`,
	description:
		'Сертификаты соответствия, одобрение типа транспортного средства и протоколы испытаний снегоболотоходов СОКОЛ. ЭПСМ на каждую машину.',
	h1: 'Документы и сертификаты',
};

export const notFoundMeta: PageMeta = {
	path: '/404',
	title: `Страница не найдена | ${BRAND}`,
	description: 'Страница не найдена. Перейдите к моделям снегоболотоходов СОКОЛ.',
	noindex: true,
};

/** Все индексируемые страницы: для пререндера и sitemap.xml */
export const allPages = (): PageMeta[] => [
	homeMeta,
	...products.map(productMeta),
	galleryMeta,
	newsMeta,
	certMeta,
];
