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
const TIMEOUT_MS = 10_000;

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
	/** Адрес страницы, с которой ушла заявка */
	page?: string;
	/** Honeypot: заполняют только боты */
	website?: string;
}

export type SendChannel = 'api' | 'emailjs' | 'honeypot';

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
		comments: p.comment || '—',
		product_name: p.model || p.subject || 'Заявка с сайта',
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

	let body: { ok?: boolean; errors?: Record<string, string> } | null = null;
	try {
		body = await res.json();
	} catch {
		// Не JSON — значит ответила не наша функция (например, SPA-заглушка)
	}

	if (res.status === 400 && body) throw new RequestValidationError(body.errors);
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
	await sendViaEmailJs(data);
	return 'emailjs';
}
