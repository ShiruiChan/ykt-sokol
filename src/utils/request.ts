/**
 * Единая точка отправки заявок: свой endpoint /api/request.
 * Сервер отправляет заявку письмом на рабочую почту (серверы в РФ),
 * в Telegram уходит только сигнал без персональных данных. Сторонних
 * сервисов в браузере нет: данные клиента уходят только на наш сервер (152-ФЗ).
 */

const ENDPOINT = '/api/request';
// Сервер ждёт почту до ~15 с и сигнал в Telegram до 8 с — запас, чтобы не оборвать доставку
const TIMEOUT_MS = 30_000;

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
	/** Отдельное согласие на обработку ПДн (галочка в форме). Без него сервер заявку не примет */
	consent: true;
	/** Honeypot: заполняют только боты */
	website?: string;
}

export type SendChannel = 'mail' | 'honeypot';

/** Заявка не доставлена: сеть, сервер или почта недоступны */
export class RequestDeliveryError extends Error {
	constructor(reason: string) {
		super(reason);
		this.name = 'RequestDeliveryError';
	}
}

/** Сервер отказал не из-за сбоя: лимит, размер, чужой источник */
export class RequestRejectedError extends Error {
	reason: string;
	constructor(reason: string) {
		super(reason);
		this.name = 'RequestRejectedError';
		this.reason = reason;
	}
}

/** Сервер отклонил данные — подсвечиваем поля */
export class RequestValidationError extends Error {
	errors: Record<string, string>;
	constructor(errors: Record<string, string> = {}) {
		super('validation');
		this.name = 'RequestValidationError';
		this.errors = errors;
	}
}

async function sendViaApi(p: RequestPayload): Promise<SendChannel> {
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
		throw new RequestDeliveryError('network');
	} finally {
		window.clearTimeout(timer);
	}

	let body: { ok?: boolean; channel?: SendChannel; reason?: string; errors?: Record<string, string> } | null = null;
	try {
		body = await res.json();
	} catch {
		// Не JSON — ответил не наш сервер (nginx, заглушка)
	}

	if (res.status === 400 && body) throw new RequestValidationError(body.errors);
	// 403 — чужой сайт, 413 — слишком большая, 429 — лимит
	if ((res.status === 403 || res.status === 413 || res.status === 429) && body)
		throw new RequestRejectedError(body.reason ?? String(res.status));
	if (res.ok && body?.ok) return body.channel ?? 'mail';
	// 503 — почта не настроена, 502 — почта не ответила, прочее — сбой сервера
	throw new RequestDeliveryError(body?.reason ?? String(res.status));
}

export async function sendRequest(payload: RequestPayload): Promise<SendChannel> {
	// Бота молча «принимаем», никуда не отправляя
	if (payload.website?.trim()) return 'honeypot';

	const data: RequestPayload = {
		...payload,
		page: payload.page ?? (typeof window !== 'undefined' ? window.location.href : undefined),
	};

	return sendViaApi(data);
}
