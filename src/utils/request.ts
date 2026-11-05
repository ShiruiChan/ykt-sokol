/**
 * Единая точка отправки заявок.
 * Основной канал — свой endpoint /api/request (Telegram-бот на сервере).
 * Пока бот не настроен или функция недоступна (локальный vite, сбой сети),
 * заявка уходит резервным каналом через EmailJS — чтобы клиент не потерялся.
 * Ошибку валидации (400) не дублируем в почту: там те же данные.
 */
import emailjs from '@emailjs/browser';

const EMAILJS_PUBLIC_KEY = 'TM3V3hM-DcofEcNaA';
const EMAILJS_SERVICE_ID = 'service_f50pda5';
const EMAILJS_TEMPLATE_ID = 'template_jo8mi7s';

const ENDPOINT = '/api/request';
// Сервер ждёт Telegram до 8 с плюс холодный старт функции. Меньший таймаут
// приводил к дублю: клиент уходил в EmailJS, а заявка всё равно доходила в Telegram
const TIMEOUT_MS = 15_000;

export interface RequestAccessory {
	name: string;
	price: number;
}

export interface RequestPayload {
	name: string;
	/** Телефон или почта */
	contact: string;
	comment?: string;
	/** Тема заявки, если она не про конкретную модель */
	subject?: string;
	model?: string;
	price?: number;
	accessories?: RequestAccessory[];
	total?: number;
	/** Количество машин в КП; итог total уже умножен на него */
	quantity?: number;
	/** ИНН покупателя — для КП организации */
	inn?: string;
	/** Номер сформированного коммерческого предложения: КП-20261103-7KQ2 */
	kpNumber?: string;
	/** Адрес страницы, с которой ушла заявка */
	page?: string;
	/** Honeypot: заполняют только боты */
	website?: string;
}

export type SendChannel = 'api' | 'emailjs' | 'honeypot';

/** Сервер отказал не из-за сбоя (лимит, размер, чужой источник) — дублировать в почту нельзя */
export class RequestRejectedError extends Error {
	reason: string;
	constructor(reason: string) {
		super(reason);
		this.name = 'RequestRejectedError';
		this.reason = reason;
	}
}

/** Сервер отклонил данные — показываем ошибку, резервный канал не поможет */
export class RequestValidationError extends Error {
	errors: Record<string, string>;
	constructor(errors: Record<string, string> = {}) {
		super('validation');
		this.name = 'RequestValidationError';
		this.errors = errors;
	}
}

const rub = (n: number) => n.toLocaleString('ru-RU');

let emailInitialized = false;

function sendViaEmailJs(p: RequestPayload) {
	if (!emailInitialized) {
		emailjs.init(EMAILJS_PUBLIC_KEY);
		emailInitialized = true;
	}
	// Поля — под существующий шаблон письма
	return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
		from_name: p.name,
		contact: p.contact,
		// В шаблоне нет полей под КП — номер и ИНН дописываем к комментарию
		comments:
			[
				p.kpNumber && `Сформировано ${p.kpNumber}`,
				p.inn && `ИНН: ${p.inn}`,
				p.comment,
				p.kpNumber && p.page && `Документ: ${p.page}`,
			]
				.filter(Boolean)
				.join('\n') || '—',
		product_name:
			[(p.kpNumber && p.subject) || p.model || p.subject || 'Заявка с сайта', p.quantity && p.quantity > 1 && `× ${p.quantity} шт.`]
				.filter(Boolean)
				.join(' '),
		product_price: p.price !== undefined ? rub(p.price) : '—',
		accessories:
			p.accessories?.map((a) => `${a.name}: ${rub(a.price)} ₽`).join('\n') ||
			'Нет выбранных аксессуаров',
		total_price: p.total !== undefined ? rub(p.total) : '—',
	});
}

type ApiResult = 'sent' | 'fallback';

async function sendViaApi(p: RequestPayload): Promise<ApiResult> {
	const controller = new AbortController();
	const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

	let res: Response;
	try {
		res = await fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(p),
			signal: controller.signal,
		});
	} catch {
		return 'fallback'; // сеть, таймаут
	} finally {
		window.clearTimeout(timer);
	}

	let body: { ok?: boolean; reason?: string; errors?: Record<string, string> } | null = null;
	try {
		body = await res.json();
	} catch {
		// Не JSON — значит ответила не наша функция (например, SPA-заглушка)
	}

	if (res.status === 400 && body) throw new RequestValidationError(body.errors);
	// Ответ нашей функции с осмысленным отказом: 403 — чужой сайт, 413 — слишком большая, 429 — лимит
	if ((res.status === 403 || res.status === 413 || res.status === 429) && body)
		throw new RequestRejectedError(body.reason ?? String(res.status));
	if (res.ok && body?.ok) return 'sent';
	// 404/405 — функции нет, 503 — не настроен бот, 5xx — Telegram недоступен
	return 'fallback';
}

export async function sendRequest(payload: RequestPayload): Promise<SendChannel> {
	// Бота молча «принимаем», никуда не отправляя
	if (payload.website?.trim()) return 'honeypot';

	const data: RequestPayload = {
		...payload,
		page: payload.page ?? (typeof window !== 'undefined' ? window.location.href : undefined),
	};

	if ((await sendViaApi(data)) === 'sent') return 'api';
	// На локальной разработке резервный канал не включаем: тест не должен стать реальным лидом
	if (import.meta.env.DEV) throw new Error('dev: /api/request недоступен, EmailJS на dev отключён');
	await sendViaEmailJs(data);
	return 'emailjs';
}
