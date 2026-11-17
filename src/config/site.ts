/**
 * Единый источник контактов и адреса сайта. Телефон, часы и ссылки
 * больше не дублируются по компонентам — меняются здесь один раз.
 */
import type { PhoneContact, SiteContent } from '../types';
import siteData from '../../content/site.json';

/**
 * Боевой адрес сайта (без слэша на конце). Задаётся переменной VITE_SITE_URL
 * в /etc/ykt-sokol.env на сервере; после смены — «Опубликовать» в админке.
 * Из него строятся canonical, og:url, sitemap.xml и robots.txt.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://ykt-sokol.vercel.app').replace(/\/+$/, '');

export const BRAND = 'ЯКТСокол';

/** Как бренд пишут в поиске — для schema.org alternateName */
export const BRAND_ALIASES = ['ЯКТ-Сокол', 'ЯКТ Сокол', 'Якт-Сокол', 'Сокол', 'YKT-Sokol', 'ЯКТ-СОКОЛ'];

/** Относительный путь → полный адрес; уже полный (внешняя ссылка) не трогаем */
export const absoluteUrl = (path = '/') =>
	/^https?:\/\//.test(path) ? path : `${SITE_URL}${path === '/' ? '/' : path}`;

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
