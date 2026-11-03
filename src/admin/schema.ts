/**
 * Проверка содержимого сайта. Общая для админки (подсветка ошибок до
 * сохранения) и сервера (api/admin/content/[key].ts не пишет в БД то,
 * что не прошло проверку). Без зависимостей: ручные проверки и очистка.
 *
 * validateContent возвращает либо очищенные данные (лишние поля отброшены,
 * строки обрезаны по краям), либо список ошибок «путь → текст».
 */
import type {
	Accessory,
	DefaultKit,
	DocumentItem,
	FaqItem,
	NewsItem,
	Product,
	SiteContent,
	Spec,
} from '../types';

export const CONTENT_KEYS = ['products', 'faq', 'news', 'documents', 'site'] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export interface ContentMap {
	products: Product[];
	faq: FaqItem[];
	news: NewsItem[];
	documents: DocumentItem[];
	site: SiteContent;
}

export const isContentKey = (k: unknown): k is ContentKey =>
	typeof k === 'string' && (CONTENT_KEYS as readonly string[]).includes(k);

export type ValidationError = { path: string; message: string };
export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: ValidationError[] };

/** slug: латиница в нижнем регистре, цифры и дефис — /models/<slug> */
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Подписи полей характеристик — для редактора и сообщений об ошибках */
export const SPEC_FIELDS: [keyof Omit<Spec, 'extendedSpecs'>, string][] = [
	['size', 'Габариты'],
	['height', 'Высота'],
	['engine', 'Двигатель'],
	['clearance', 'Клиренс'],
	['transmission', 'Коробка передач'],
	['seats', 'Места'],
	['maxSpeed', 'Макс. скорость'],
	['fuelConsumption', 'Расход топлива'],
];

export const EXTENDED_SPEC_FIELDS: [keyof NonNullable<Spec['extendedSpecs']>, string][] = [
	['wheelFormula', 'Колёсная формула'],
	['weight', 'Снаряжённая масса'],
	['fullWeight', 'Полная масса'],
	['enginePower', 'Мощность'],
	['torque', 'Крутящий момент'],
	['slope', 'Преодолеваемый подъём'],
	['lateralStability', 'Боковая устойчивость'],
	['suspension', 'Подвеска'],
	['steering', 'Рулевое управление'],
	['brakeSystem', 'Тормозная система'],
	['parkingBrake', 'Стояночный тормоз'],
	['tires', 'Шины'],
	['tirePressure', 'Давление в шинах'],
	['waterSpeed', 'Скорость на плаву'],
];

const LIMITS = {
	short: 200,
	medium: 600,
	long: 6000,
	url: 1000,
	items: 200,
};

class Ctx {
	errors: ValidationError[] = [];
	err(path: string, message: string) {
		if (this.errors.length < 100) this.errors.push({ path, message });
	}

	str(v: unknown, path: string, opts: { required?: boolean; max?: number } = {}): string {
		const max = opts.max ?? LIMITS.short;
		if (v === undefined || v === null) v = '';
		if (typeof v !== 'string') {
			this.err(path, 'Должна быть строка');
			return '';
		}
		const s = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
		if (opts.required && !s) this.err(path, 'Обязательное поле');
		if (s.length > max) this.err(path, `Слишком длинно (больше ${max} символов)`);
		return s;
	}

	optStr(v: unknown, path: string, max = LIMITS.short): string | undefined {
		const s = this.str(v, path, { max });
		return s ? s : undefined;
	}

	/** Ссылка на файл: корневой путь сайта (/images/…) или https:// */
	url(v: unknown, path: string, required = true): string {
		const s = this.str(v, path, { required, max: LIMITS.url });
		if (s && !/^\/(?!\/)[^\s]*$/.test(s) && !/^https:\/\/[^\s]+$/.test(s)) {
			this.err(path, 'Ссылка должна начинаться с / или https://');
		}
		return s;
	}

	price(v: unknown, path: string): number {
		if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v >= 1e10 || Math.round(v) !== v) {
			this.err(path, 'Цена — целое число рублей, без пробелов и букв');
			return 0;
		}
		return v;
	}

	intId(v: unknown, path: string): number {
		if (typeof v !== 'number' || !Number.isInteger(v) || v <= 0 || v > 1e9) {
			this.err(path, 'Неверный идентификатор');
			return 0;
		}
		return v;
	}

	array(v: unknown, path: string, max = LIMITS.items): unknown[] {
		if (!Array.isArray(v)) {
			this.err(path, 'Должен быть список');
			return [];
		}
		if (v.length > max) this.err(path, `Слишком много элементов (больше ${max})`);
		return v.slice(0, max);
	}

	obj(v: unknown, path: string): Record<string, unknown> {
		if (!v || typeof v !== 'object' || Array.isArray(v)) {
			this.err(path, 'Должен быть объект');
			return {};
		}
		return v as Record<string, unknown>;
	}
}

function cleanSpecs(c: Ctx, raw: unknown, path: string): Spec {
	const o = c.obj(raw ?? {}, path);
	const specs: Spec = {};
	for (const [k, label] of SPEC_FIELDS) {
		const v = c.optStr(o[k], `${path}.${k}`, LIMITS.medium);
		if (v) specs[k] = v;
		void label;
	}
	if (o.extendedSpecs !== undefined) {
		const e = c.obj(o.extendedSpecs, `${path}.extendedSpecs`);
		const ext: NonNullable<Spec['extendedSpecs']> = {};
		for (const [k] of EXTENDED_SPEC_FIELDS) {
			const v = c.optStr(e[k], `${path}.extendedSpecs.${k}`, LIMITS.medium);
			if (v) ext[k] = v;
		}
		if (Object.keys(ext).length) specs.extendedSpecs = ext;
	}
	return specs;
}

function cleanProduct(c: Ctx, raw: unknown, i: number): Product {
	const path = `products[${i}]`;
	const o = c.obj(raw, path);
	const slug = c.str(o.slug, `${path}.slug`, { required: true, max: 80 });
	if (slug && !SLUG_RE.test(slug)) {
		c.err(`${path}.slug`, 'Адрес — латиница в нижнем регистре, цифры и дефис (например, sokol-pro)');
	}

	const images = c
		.array(o.images ?? [], `${path}.images`, 40)
		.map((v, j) => c.url(v, `${path}.images[${j}]`));

	const defaultKit: DefaultKit[] = c.array(o.defaultKit ?? [], `${path}.defaultKit`).map((v, j) => {
		const k = c.obj(v, `${path}.defaultKit[${j}]`);
		return {
			name: c.str(k.name, `${path}.defaultKit[${j}].name`, { required: true }),
			quantity: c.str(k.quantity, `${path}.defaultKit[${j}].quantity`, { max: 60 }),
		};
	});

	const accessories: Record<string, Accessory[]> = {};
	const accRaw = c.obj(o.accessories ?? {}, `${path}.accessories`);
	const seenIds = new Set<number>();
	for (const [category, list] of Object.entries(accRaw)) {
		const cat = c.str(category, `${path}.accessories`, { required: true, max: 80 });
		if (!cat) continue;
		if (accessories[cat]) c.err(`${path}.accessories`, `Категория «${cat}» повторяется`);
		accessories[cat] = c.array(list, `${path}.accessories.${cat}`).map((v, j) => {
			const ap = `${path}.accessories.${cat}[${j}]`;
			const a = c.obj(v, ap);
			const id = c.intId(a.id, `${ap}.id`);
			if (id && seenIds.has(id)) c.err(`${ap}.id`, 'Повторяющийся идентификатор опции');
			seenIds.add(id);
			const item: Accessory = {
				id,
				name: c.str(a.name, `${ap}.name`, { required: true }),
				description: c.str(a.description, `${ap}.description`, { max: LIMITS.medium }),
				price: c.price(a.price, `${ap}.price`),
			};
			const image = a.image ? c.url(a.image, `${ap}.image`, false) : '';
			if (image) item.image = image;
			return item;
		});
	}

	return {
		id: c.intId(o.id, `${path}.id`),
		slug,
		name: c.str(o.name, `${path}.name`, { required: true }),
		description: c.str(o.description, `${path}.description`, { max: LIMITS.long }),
		deskSmall: c.str(o.deskSmall, `${path}.deskSmall`, { required: true, max: LIMITS.medium }),
		price: c.price(o.price, `${path}.price`),
		images,
		specs: cleanSpecs(c, o.specs, `${path}.specs`),
		defaultKit,
		accessories,
	};
}

function cleanProducts(c: Ctx, raw: unknown): Product[] {
	const list = c.array(raw, 'products', 50).map((p, i) => cleanProduct(c, p, i));
	if (list.length === 0) c.err('products', 'Нужна хотя бы одна модель');
	const slugs = new Map<string, number>();
	const ids = new Map<number, number>();
	list.forEach((p, i) => {
		if (p.slug && slugs.has(p.slug)) c.err(`products[${i}].slug`, `Адрес «${p.slug}» уже занят другой моделью`);
		slugs.set(p.slug, i);
		if (p.id && ids.has(p.id)) c.err(`products[${i}].id`, 'Повторяющийся идентификатор модели');
		ids.set(p.id, i);
	});
	return list;
}

function cleanFaq(c: Ctx, raw: unknown): FaqItem[] {
	return c.array(raw, 'faq').map((v, i) => {
		const o = c.obj(v, `faq[${i}]`);
		const item: FaqItem = {
			q: c.str(o.q, `faq[${i}].q`, { required: true, max: 300 }),
			a: c.str(o.a, `faq[${i}].a`, { required: true, max: 3000 }),
		};
		if (o.home === true) item.home = true;
		return item;
	});
}

function cleanNews(c: Ctx, raw: unknown): NewsItem[] {
	const list = c.array(raw, 'news', 500).map((v, i) => {
		const p = `news[${i}]`;
		const o = c.obj(v, p);
		const date = c.str(o.date, `${p}.date`, { required: true, max: 10 });
		if (date && !DATE_RE.test(date)) c.err(`${p}.date`, 'Дата в формате ГГГГ-ММ-ДД');
		const item: NewsItem = {
			id: c.intId(o.id, `${p}.id`),
			title: c.str(o.title, `${p}.title`, { required: true, max: 300 }),
			content: c.str(o.content, `${p}.content`, { required: true, max: LIMITS.long }),
			date,
		};
		const image = o.image ? c.url(o.image, `${p}.image`, false) : '';
		if (image) item.image = image;
		const summary = c.optStr(o.summary, `${p}.summary`, LIMITS.medium);
		if (summary) item.summary = summary;
		const sourceUrl = o.sourceUrl ? c.url(o.sourceUrl, `${p}.sourceUrl`, false) : '';
		if (sourceUrl) item.sourceUrl = sourceUrl;
		const sourceName = c.optStr(o.sourceName, `${p}.sourceName`);
		if (sourceName) item.sourceName = sourceName;
		const tags = c
			.array(o.tags ?? [], `${p}.tags`, 20)
			.map((t, j) => c.str(t, `${p}.tags[${j}]`, { max: 60 }))
			.filter(Boolean);
		if (tags.length) item.tags = tags;
		item.isPinned = o.isPinned === true;
		return item;
	});
	const ids = new Set<number>();
	list.forEach((n, i) => {
		if (n.id && ids.has(n.id)) c.err(`news[${i}].id`, 'Повторяющийся идентификатор новости');
		ids.add(n.id);
	});
	return list;
}

function cleanDocuments(c: Ctx, raw: unknown): DocumentItem[] {
	const list = c.array(raw, 'documents').map((v, i) => {
		const p = `documents[${i}]`;
		const o = c.obj(v, p);
		const item: DocumentItem = {
			id: c.str(o.id, `${p}.id`, { required: true, max: 60 }),
			url: c.url(o.url, `${p}.url`),
			title: c.str(o.title, `${p}.title`, { required: true, max: 300 }),
		};
		const description = c.optStr(o.description, `${p}.description`, 1000);
		if (description) item.description = description;
		return item;
	});
	const ids = new Set<string>();
	list.forEach((d, i) => {
		if (ids.has(d.id)) c.err(`documents[${i}].id`, 'Повторяющийся идентификатор документа');
		ids.add(d.id);
	});
	return list;
}

/** «+7 (996) 914-14-14» → «tel:+79969141414» */
export function telHref(label: string): string {
	const digits = label.replace(/\D/g, '');
	const normalized = digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;
	return `tel:+${normalized}`;
}

function cleanSite(c: Ctx, raw: unknown): SiteContent {
	const o = c.obj(raw, 'site');
	const phones = c.obj(o.phones, 'site.phones');
	const phone = (key: 'main' | 'extra') => {
		const p = c.obj(phones[key], `site.phones.${key}`);
		const label = c.str(p.label, `site.phones.${key}.label`, { required: true, max: 40 });
		if (label && label.replace(/\D/g, '').length < 10) c.err(`site.phones.${key}.label`, 'Похоже, в номере не хватает цифр');
		return { label, href: telHref(label) };
	};
	const a = c.obj(o.address, 'site.address');
	const h = c.obj(o.hours, 'site.hours');
	const m = c.obj(o.messengers, 'site.messengers');
	const opens = c.str(h.opens, 'site.hours.opens', { required: true, max: 5 });
	const closes = c.str(h.closes, 'site.hours.closes', { required: true, max: 5 });
	if (opens && !TIME_RE.test(opens)) c.err('site.hours.opens', 'Время в формате ЧЧ:ММ');
	if (closes && !TIME_RE.test(closes)) c.err('site.hours.closes', 'Время в формате ЧЧ:ММ');
	return {
		phones: { main: phone('main'), extra: phone('extra') },
		address: {
			city: c.str(a.city, 'site.address.city', { required: true }),
			street: c.str(a.street, 'site.address.street', { required: true }),
			full: c.str(a.full, 'site.address.full', { required: true }),
			short: c.str(a.short, 'site.address.short', { required: true }),
			routeUrl: c.url(a.routeUrl, 'site.address.routeUrl'),
		},
		hours: {
			label: c.str(h.label, 'site.hours.label', { required: true }),
			short: c.str(h.short, 'site.hours.short', { required: true }),
			opens,
			closes,
		},
		messengers: {
			whatsapp: c.url(m.whatsapp, 'site.messengers.whatsapp'),
			telegram: c.url(m.telegram, 'site.messengers.telegram'),
		},
	};
}

const CLEANERS: { [K in ContentKey]: (c: Ctx, raw: unknown) => ContentMap[K] } = {
	products: cleanProducts,
	faq: cleanFaq,
	news: cleanNews,
	documents: cleanDocuments,
	site: cleanSite,
};

export function validateContent<K extends ContentKey>(key: K, raw: unknown): ValidationResult<ContentMap[K]> {
	const c = new Ctx();
	const data = CLEANERS[key](c, raw);
	return c.errors.length ? { ok: false, errors: c.errors } : { ok: true, data };
}
