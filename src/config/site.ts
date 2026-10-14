/**
 * Единый источник контактов и адреса сайта. Телефон, часы и ссылки
 * больше не дублируются по компонентам — меняются здесь один раз.
 */

/** Боевой адрес сайта. При переезде на свой домен меняется только эта строка. */
export const SITE_URL = 'https://ykt-sokol.vercel.app';

export const BRAND = 'ЯКТ СОКОЛ';

export const absoluteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`;

export interface PhoneContact {
	/** Для ссылки tel: — только цифры и плюс */
	href: string;
	/** Как показываем людям */
	label: string;
}

export const PHONES: { main: PhoneContact; extra: PhoneContact } = {
	main: { href: 'tel:+79969141414', label: '+7 (996) 914-14-14' },
	extra: { href: 'tel:+79142767520', label: '+7 (914) 276-75-20' },
};

export const PHONE = PHONES.main;

export const ADDRESS = {
	city: 'г. Якутск',
	street: 'ул. Чусовского, 75/3',
	full: 'г. Якутск, ул. Чусовского, 75/3',
	short: 'Чусовского, 75/3',
	routeUrl:
		'https://2gis.ru/yakutsk/search/%D0%A7%D1%83%D1%81%D0%BE%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE%2075%2F3',
};

export const HOURS = {
	label: 'Ежедневно, 9:00–18:00',
	short: 'ежедневно 9:00–18:00',
	/** Для schema.org */
	opens: '09:00',
	closes: '18:00',
};

/**
 * Мессенджеры. Ссылки ведут на основной номер: WhatsApp и Telegram
 * открывают чат по номеру телефона, если он зарегистрирован в мессенджере.
 */
export const MESSENGERS = {
	whatsapp: 'https://wa.me/79969141414',
	telegram: 'https://t.me/+79969141414',
};

/** Основная навигация — общая для шапки, мобильного меню и подвала */
export const NAV = [
	{ to: '/', label: 'Главная' },
	{ to: '/compare', label: 'Сравнение' },
	{ to: '/service', label: 'Покупка' },
	{ to: '/gallery', label: 'Галерея' },
	{ to: '/news', label: 'Новости' },
	{ to: '/cert', label: 'Документы' },
];
