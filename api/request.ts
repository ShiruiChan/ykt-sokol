/**
 * Приём заявок с сайта (Vercel Function).
 * Заявка уходит в Telegram через Bot API — данные не проходят через
 * сторонние почтовые сервисы, а токен бота живёт только на сервере.
 * Новых зависимостей нет: только fetch и Web Request/Response.
 */

/** Верхняя граница тела запроса — заявке больше не нужно */
const MAX_BODY = 16_000;
const MAX_ACCESSORIES = 60;

const LIMITS = {
	name: 100,
	contact: 100,
	comment: 2000,
	model: 200,
	subject: 200,
	page: 300,
	accessory: 200,
} as const;

interface Accessory {
	name: string;
	price: number;
}

interface CleanRequest {
	name: string;
	contact: string;
	comment: string;
	subject: string;
	model: string;
	price: number | null;
	accessories: Accessory[];
	total: number | null;
	page: string;
}

const json = (status: number, body: Record<string, unknown>) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
	});

/** Строка без управляющих символов, обрезанная по краям; не-строка — пустая */
const text = (v: unknown) =>
	typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim() : '';

const money = (v: unknown) =>
	typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 1e10 ? Math.round(v) : null;

type Validation = { ok: true; data: CleanRequest } | { ok: false; errors: Record<string, string> };

function validate(raw: Record<string, unknown>): Validation {
	const errors: Record<string, string> = {};

	const name = text(raw.name);
	const contact = text(raw.contact);
	const comment = text(raw.comment);
	const subject = text(raw.subject);
	const model = text(raw.model);
	const page = text(raw.page);

	if (name.length < 2) errors.name = 'required';
	else if (name.length > LIMITS.name) errors.name = 'too_long';

	// Телефон (минимум 6 цифр) или почта — иначе перезвонить некуда
	const digits = contact.replace(/\D/g, '').length;
	if (!contact) errors.contact = 'required';
	else if (contact.length > LIMITS.contact) errors.contact = 'too_long';
	else if (digits < 6 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) errors.contact = 'invalid';

	if (comment.length > LIMITS.comment) errors.comment = 'too_long';
	if (subject.length > LIMITS.subject) errors.subject = 'too_long';
	if (model.length > LIMITS.model) errors.model = 'too_long';
	if (page.length > LIMITS.page) errors.page = 'too_long';

	const accessories: Accessory[] = [];
	if (raw.accessories !== undefined) {
		if (!Array.isArray(raw.accessories) || raw.accessories.length > MAX_ACCESSORIES) {
			errors.accessories = 'invalid';
		} else {
			for (const item of raw.accessories) {
				const a = (item ?? {}) as Record<string, unknown>;
				const accName = text(a.name);
				const price = money(a.price);
				if (!accName || accName.length > LIMITS.accessory || price === null) {
					errors.accessories = 'invalid';
					break;
				}
				accessories.push({ name: accName, price });
			}
		}
	}

	if (Object.keys(errors).length) return { ok: false, errors };

	return {
		ok: true,
		data: {
			name,
			contact,
			comment,
			subject,
			model,
			price: money(raw.price),
			accessories,
			total: money(raw.total),
			page,
		},
	};
}

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

/** Текст сообщения: сначала что хотят купить, затем кому перезвонить */
function formatMessage(r: CleanRequest) {
	const lines: string[] = ['<b>Новая заявка с сайта</b>', ''];

	if (r.model) lines.push(`<b>Модель:</b> ${escapeHtml(r.model)}`);
	else if (r.subject) lines.push(`<b>Тема:</b> ${escapeHtml(r.subject)}`);
	if (r.price !== null) lines.push(`<b>Базовая цена:</b> ${rub(r.price)}`);

	if (r.accessories.length) {
		lines.push('<b>Аксессуары:</b>');
		for (const a of r.accessories) lines.push(`• ${escapeHtml(a.name)} — ${rub(a.price)}`);
	} else if (r.model) {
		lines.push('<b>Аксессуары:</b> не выбраны');
	}
	if (r.total !== null) lines.push(`<b>Итого:</b> ${rub(r.total)}`);

	if (lines.length > 2) lines.push('');
	lines.push(`<b>Имя:</b> ${escapeHtml(r.name)}`);
	lines.push(`<b>Контакт:</b> ${escapeHtml(r.contact)}`);
	if (r.comment) lines.push(`<b>Комментарий:</b> ${escapeHtml(r.comment)}`);
	if (r.page) lines.push('', `<b>Страница:</b> ${escapeHtml(r.page)}`);

	return lines.join('\n');
}

export async function POST(request: Request): Promise<Response> {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const chatId = process.env.TELEGRAM_CHAT_ID;
	// Клиент по этому ответу переключится на резервный канал
	if (!token || !chatId) return json(503, { ok: false, reason: 'not_configured' });

	const declared = Number(request.headers.get('content-length') || 0);
	if (declared > MAX_BODY) return json(413, { ok: false, reason: 'too_large' });

	let raw: Record<string, unknown>;
	try {
		const body = await request.text();
		if (body.length > MAX_BODY) return json(413, { ok: false, reason: 'too_large' });
		const parsed: unknown = JSON.parse(body);
		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('shape');
		raw = parsed as Record<string, unknown>;
	} catch {
		return json(400, { ok: false, reason: 'bad_json' });
	}

	// Honeypot: человек это поле не видит. Боту отвечаем «успехом», чтобы не подбирал обход
	if (text(raw.website)) return json(200, { ok: true });

	const result = validate(raw);
	if (!result.ok) return json(400, { ok: false, reason: 'validation', errors: result.errors });

	try {
		const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text: formatMessage(result.data),
				parse_mode: 'HTML',
				disable_web_page_preview: true,
			}),
			signal: AbortSignal.timeout(8000),
		});
		if (!res.ok) {
			// В лог — только код и описание от Telegram, без данных клиента
			const detail = await res.text().catch(() => '');
			console.error('telegram_failed', res.status, detail.slice(0, 300));
			return json(502, { ok: false, reason: 'delivery_failed' });
		}
	} catch (err) {
		console.error('telegram_unreachable', err instanceof Error ? err.message : 'unknown');
		return json(502, { ok: false, reason: 'delivery_failed' });
	}

	return json(200, { ok: true });
}
