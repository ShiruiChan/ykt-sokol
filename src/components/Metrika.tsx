import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookieConsent } from '../utils/cookieConsent';

/**
 * Яндекс.Метрика. Номер счётчика берётся из VITE_YM_ID — без него
 * компонент ничего не делает, так что локально и на превью статистика
 * не засоряется. Счётчик загружается только после «Разрешить» в баннере
 * о cookie (components/CookieBanner.tsx).
 */
const YM_ID = Number(import.meta.env.VITE_YM_ID) || 0;
export const YM_ENABLED = YM_ID > 0;

type Ym = ((id: number, method: string, ...args: unknown[]) => void) & { a?: unknown[]; l?: number };

declare global {
	interface Window {
		ym?: Ym;
	}
}

function load() {
	if (window.ym) return;
	const ym: Ym = (...args: unknown[]) => {
		(ym.a = ym.a || []).push(args);
	};
	ym.l = Date.now();
	window.ym = ym;

	const script = document.createElement('script');
	script.async = true;
	script.src = 'https://mc.yandex.ru/metrika/tag.js';
	document.head.appendChild(script);

	window.ym(YM_ID, 'init', {
		defer: true,
		clickmap: true,
		trackLinks: true,
		accurateTrackBounce: true,
		webvisor: true,
	});
}

/** Отправить цель Метрики. Безопасно вызывать, даже если счётчик не подключён. */
export function reachGoal(goal: string, params?: Record<string, unknown>) {
	if (YM_ID && window.ym) window.ym(YM_ID, 'reachGoal', goal, params);
}

export default function Metrika() {
	const { pathname, search } = useLocation();
	const first = useRef(true);
	const granted = useCookieConsent((s) => s.choice === 'granted');

	useEffect(() => {
		if (!YM_ID || !granted) return;
		load();

		// Клики по телефону и мессенджерам — отдельные цели, без правки каждой ссылки
		const onClick = (e: MouseEvent) => {
			const link = (e.target as HTMLElement).closest('a');
			const href = link?.getAttribute('href') ?? '';
			if (href.startsWith('tel:')) reachGoal('phone_click');
			else if (href.includes('wa.me')) reachGoal('whatsapp_click');
			else if (href.includes('t.me')) reachGoal('telegram_click');
		};
		document.addEventListener('click', onClick);
		return () => document.removeEventListener('click', onClick);
	}, [granted]);

	// SPA: просмотр страницы при каждом переходе (первый засчитывает init)
	useEffect(() => {
		if (!YM_ID || !window.ym) return;
		if (first.current) {
			first.current = false;
			return;
		}
		window.ym(YM_ID, 'hit', window.location.href);
	}, [pathname, search]);

	return null;
}
