/**
 * Единая точка отправки заявок. Механизм прежний — EmailJS с теми же
 * service/template/public key, что использовались на странице товара.
 * Вынесено сюда, чтобы форма в модалке и форма на карточке товара
 * отправляли письма в одном формате.
 */
import emailjs from '@emailjs/browser';

export const EMAILJS_PUBLIC_KEY = 'TM3V3hM-DcofEcNaA';
export const EMAILJS_SERVICE_ID = 'service_f50pda5';
export const EMAILJS_TEMPLATE_ID = 'template_jo8mi7s';

let initialized = false;

export function initEmailJs() {
	if (initialized) return;
	emailjs.init(EMAILJS_PUBLIC_KEY);
	initialized = true;
}

export interface RequestPayload {
	from_name: string;
	contact: string;
	comments: string;
	product_name: string;
	product_price: string;
	accessories: string;
	total_price: string;
}

export function sendRequest(params: RequestPayload) {
	initEmailJs();
	return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { ...params });
}
