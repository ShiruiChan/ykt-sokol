/**
 * Коммерческое предложение со страницы модели.
 *
 * В адрес документа (/kp?model=…&opts=…&n=…) попадают только модель,
 * id опций и номер КП — ни имени, ни телефона. Данные покупателя живут
 * в sessionStorage: вкладка закрылась — их больше нет.
 * Отправка менеджеру идёт в фоне; её статус хранится здесь, чтобы
 * страница документа его показала, а сбой сети не мешал открыть КП.
 */
import { create } from 'zustand';
import { productBySlug } from '../data/products';
import type { Accessory, Product } from '../types';
import { absoluteUrl } from '../config/site';
import { reachGoal } from '../components/Metrika';
import { sendRequest, type RequestPayload, type SendChannel } from './request';

export const KP_PATH = '/kp';

/** Что клиент ввёл в форме */
export interface KpBuyer {
	/** ФИО или название организации */
	name: string;
	phone: string;
	inn: string;
	comment: string;
}

export interface KpDocument {
	product: Product;
	options: Accessory[];
	/** Сколько машин в этой комплектации (1–99) */
	qty: number;
	/** Итог за все машины */
	total: number;
	/** Код из адреса: 20261103-7KQ2 */
	code: string;
	/** КП-20261103-7KQ2 */
	number: string;
	date: Date;
}

/* ------------------------------- Номер КП -------------------------------- */

// Без 0/O и 1/I — код читают по телефону
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_RE = /^(\d{4})(\d{2})(\d{2})-([2-9A-HJ-NP-Z]{4})$/;

const pad = (n: number) => String(n).padStart(2, '0');

function randomSuffix(): string {
	const bytes = new Uint8Array(4);
	globalThis.crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

/** Новый код КП на дату: 20261103-7KQ2 */
export function makeKpCode(date = new Date()): string {
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${randomSuffix()}`;
}

export const kpNumber = (code: string) => `КП-${code}`;

/** Дата из кода; null — код подделан или повреждён */
export function kpDateFromCode(code: string): Date | null {
	const m = CODE_RE.exec(code);
	if (!m) return null;
	const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
	// Date «перекатывает» 13-й месяц и 32-е число — такой код считаем повреждённым
	return date.getDate() === Number(m[3]) && date.getMonth() === Number(m[2]) - 1 ? date : null;
}

export const formatDate = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

/* --------------------------------- Адрес --------------------------------- */

export const KP_MAX_QTY = 99;

/** Количество из ввода или адреса: целое 1–99, всё остальное — 1 */
export const clampQty = (v: unknown) => {
	const n = Number(v);
	return Number.isInteger(n) && n >= 1 && n <= KP_MAX_QTY ? n : 1;
};

export function kpUrl(product: Product, optionIds: number[], code: string, qty = 1): string {
	const params = new URLSearchParams({ model: product.slug });
	if (optionIds.length) params.set('opts', optionIds.join(','));
	if (qty > 1) params.set('q', String(clampQty(qty)));
	params.set('n', code);
	return `${KP_PATH}?${params.toString()}`;
}

/** Собрать документ из параметров адреса. Неизвестные опции отбрасываются. */
export function parseKp(search: string): KpDocument | null {
	const params = new URLSearchParams(search);
	const product = productBySlug(params.get('model') ?? undefined);
	const code = params.get('n') ?? '';
	const date = kpDateFromCode(code);
	if (!product || !date) return null;

	const ids = new Set(
		(params.get('opts') ?? '')
			.split(',')
			.map((s) => Number(s))
			.filter((n) => Number.isInteger(n) && n > 0)
	);
	// Порядок — как на странице модели, без дублей
	const options = Object.values(product.accessories)
		.flat()
		.filter((a) => ids.has(a.id));
	const qty = clampQty(params.get('q') ?? 1);
	const total = (product.price + options.reduce((sum, a) => sum + a.price, 0)) * qty;

	return { product, options, qty, total, code, number: kpNumber(code), date };
}

/* ---------------------------- Данные покупателя -------------------------- */

const buyerKey = (code: string) => `kp-buyer:${code}`;

export function saveBuyer(code: string, buyer: KpBuyer) {
	try {
		sessionStorage.setItem(buyerKey(code), JSON.stringify(buyer));
	} catch {
		// Приватный режим / переполнение — документ откроется без покупателя
	}
}

export function loadBuyer(code: string): KpBuyer | null {
	try {
		const raw = sessionStorage.getItem(buyerKey(code));
		if (!raw) return null;
		const b = JSON.parse(raw) as Partial<KpBuyer>;
		if (typeof b.name !== 'string' || typeof b.phone !== 'string') return null;
		return {
			name: b.name,
			phone: b.phone,
			inn: typeof b.inn === 'string' ? b.inn : '',
			comment: typeof b.comment === 'string' ? b.comment : '',
		};
	} catch {
		return null;
	}
}

/* --------------------------------- ИНН ----------------------------------- */

/** ИНН организации (10 цифр) или ИП/физлица (12) с проверкой контрольных цифр */
export function isValidInn(value: string): boolean {
	const d = value.replace(/\s/g, '');
	if (!/^\d{10}$|^\d{12}$/.test(d)) return false;
	const digits = Array.from(d, Number);
	const check = (weights: number[]) =>
		(weights.reduce((sum, w, i) => sum + w * digits[i], 0) % 11) % 10;
	if (digits.length === 10) return check([2, 4, 10, 3, 5, 9, 4, 6, 8]) === digits[9];
	return (
		check([7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === digits[10] &&
		check([3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]) === digits[11]
	);
}

/* ------------------------------ Отправка --------------------------------- */

export function kpPayload(doc: KpDocument, buyer: KpBuyer, website = ''): RequestPayload {
	return {
		name: buyer.name,
		contact: buyer.phone,
		comment: buyer.comment || undefined,
		inn: buyer.inn || undefined,
		kpNumber: doc.number,
		subject: `КП: ${doc.product.name}`,
		model: doc.qty > 1 ? `${doc.product.name} × ${doc.qty} шт.` : doc.product.name,
		quantity: doc.qty,
		price: doc.product.price,
		accessories: doc.options.map((a) => ({ name: a.name, price: a.price })),
		total: doc.total,
		// Ссылка на документ без персональных данных — менеджер откроет тот же расчёт
		page: absoluteUrl(kpUrl(doc.product, doc.options.map((a) => a.id), doc.code, doc.qty)),
		website,
	};
}

export type KpSendStatus = 'sending' | 'sent' | 'error';

interface KpSendState {
	status: Record<string, KpSendStatus>;
	set: (code: string, status: KpSendStatus) => void;
}

export const useKpSend = create<KpSendState>((set) => ({
	status: {},
	set: (code, status) => set((s) => ({ status: { ...s.status, [code]: status } })),
}));

/**
 * Отправить КП менеджеру в фоне. Не бросает: результат — в useKpSend,
 * страница документа открывается сразу, не дожидаясь сети.
 */
export function sendKp(doc: KpDocument, buyer: KpBuyer, website = ''): Promise<SendChannel | null> {
	const { set } = useKpSend.getState();
	set(doc.code, 'sending');
	return sendRequest(kpPayload(doc, buyer, website))
		.then((channel) => {
			set(doc.code, 'sent');
			reachGoal('request_sent', { subject: `КП: ${doc.product.name}`, channel });
			return channel;
		})
		.catch(() => {
			set(doc.code, 'error');
			reachGoal('request_error', { subject: `КП: ${doc.product.name}`, reason: 'delivery' });
			return null;
		});
}
