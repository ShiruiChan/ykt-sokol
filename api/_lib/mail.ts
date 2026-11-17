/**
 * Канал заявок — письмо через SMTP почты с серверами в РФ (VK WorkSpace /
 * Mail.ru, Яндекс 360). Персональные данные из заявки уходят только сюда.
 * Письмо отправляет сервер, браузер клиента со сторонними сервисами не общается.
 *
 *   SMTP_URL=smtps://login%40domain.ru:пароль-для-внешнего-приложения@smtp.mail.ru:465
 *   MAIL_TO=sales@domain.ru            — куда слать, можно несколько через запятую
 *   MAIL_FROM=login@domain.ru          — от кого (по умолчанию логин из SMTP_URL)
 */
import nodemailer, { type Transporter } from 'nodemailer';

let transport: Transporter | null | undefined;

function getTransport(): Transporter | null {
	if (transport !== undefined) return transport;
	const url = process.env.SMTP_URL;
	transport = url && process.env.MAIL_TO ? nodemailer.createTransport(url, { connectionTimeout: 10_000, socketTimeout: 15_000 }) : null;
	return transport;
}

export const mailConfigured = () => Boolean(process.env.SMTP_URL && process.env.MAIL_TO);

function sender(): string | undefined {
	if (process.env.MAIL_FROM) return process.env.MAIL_FROM;
	try {
		const user = decodeURIComponent(new URL(process.env.SMTP_URL ?? '').username);
		return user.includes('@') ? user : undefined;
	} catch {
		return undefined;
	}
}

/** html — тот же текст, что уходит в Telegram (<b>, переносы строк) */
export async function sendMail(subject: string, html: string): Promise<void> {
	const t = getTransport();
	if (!t) throw new Error('smtp_not_configured');
	const from = sender();
	await t.sendMail({
		from: from ? `"Сайт ЯКТСокол" <${from}>` : undefined,
		to: process.env.MAIL_TO,
		subject,
		text: html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
		html: `<div style="font:15px/1.5 sans-serif">${html.replace(/\n/g, '<br>')}</div>`,
	});
}
