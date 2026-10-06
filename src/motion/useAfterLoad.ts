/**
 * true, когда страница загрузилась и браузер свободен. По этому флагу
 * монтируются lazy-сцены gsap: библиотека не конкурирует с LCP-картинкой
 * за сеть и главный поток. При prefers-reduced-motion остаётся false,
 * и gsap не загружается вовсе: контент статичен.
 */
import { useEffect, useState } from 'react';
import { matches, MQ } from './media';

export function useAfterLoad() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		if (matches(MQ.reduce)) return;

		let idle = 0;
		let timeout = 0;
		const go = () => {
			if (typeof window.requestIdleCallback === 'function') {
				idle = window.requestIdleCallback(() => setReady(true), { timeout: 1200 });
			} else {
				timeout = window.setTimeout(() => setReady(true), 150);
			}
		};

		if (document.readyState === 'complete') go();
		else window.addEventListener('load', go, { once: true });

		return () => {
			window.removeEventListener('load', go);
			if (idle) window.cancelIdleCallback(idle);
			window.clearTimeout(timeout);
		};
	}, []);

	return ready;
}

/**
 * Элементы, ещё не дошедшие до вьюпорта. Прятать до анимации можно только их:
 * то, что пользователь уже видит (быстро проскроллил до загрузки сцены),
 * не должно мигнуть.
 */
export function belowViewport<T extends Element>(els: T[]) {
	const h = window.innerHeight;
	return els.filter((el) => el.getBoundingClientRect().top > h);
}
