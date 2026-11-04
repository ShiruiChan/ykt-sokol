/**
 * Единый источник контактов и адреса сайта. Телефон, часы и ссылки
 * больше не дублируются по компонентам — меняются здесь один раз.
 */
import type { PhoneContact, SiteContent } from '../types';
import siteData from '../../content/site.json';

/** Боевой адрес сайта. При переезде на свой домен меняется только эта строка. */
export const SITE_URL = 'https://ykt-sokol.vercel.app';

export const BRAND = 'ЯКТСокол';

export const absoluteUrl = (path = '/') => `${SITE_URL}${path === '/' ? '/' : path}`;

export type { PhoneContact };

/** Контакты правятся в админ-панели и лежат в снимке content/site.json */
const site = siteData as SiteContent;

export const PHONES: SiteContent['phones'] = site.phones;

export const PHONE = PHONES.main;

export const ADDRESS: SiteContent['address'] = site.address;

/** label/short — для людей, opens/closes — для schema.org */
export const HOURS: SiteContent['hours'] = site.hours;

/**
 * Мессенджеры. Ссылки ведут на основной номер: WhatsApp и Telegram
 * открывают чат по номеру телефона, если он зарегистрирован в мессенджере.
 */
export const MESSENGERS: SiteContent['messengers'] = site.messengers;

/** Основная навигация — общая для шапки, мобильного меню и подвала */
export const NAV = [
	{ to: '/', label: 'Главная' },
	{ to: '/compare', label: 'Сравнение' },
	{ to: '/service', label: 'Покупка' },
	{ to: '/gallery', label: 'Галерея' },
	{ to: '/news', label: 'Новости' },
	{ to: '/cert', label: 'Документы' },
];
