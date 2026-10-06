/**
 * Единая точка входа gsap. Импортируется ТОЛЬКО из lazy-модулей сцен,
 * поэтому gsap уходит в отдельный чанк и не попадает в стартовый бандл.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { emitRefreshed, registerRefresher } from './refreshBus';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// На телефонах адресная строка дёргает высоту окна: не пересчитываем из-за этого
ScrollTrigger.config({ ignoreMobileResize: true });

let timer = 0;

/** Отложенный пересчёт: секции догружаются lazy и сдвигают позиции триггеров */
export function refreshSoon(delay = 120) {
	window.clearTimeout(timer);
	timer = window.setTimeout(() => {
		ScrollTrigger.sort();
		ScrollTrigger.refresh();
	}, delay);
}

// Высота документа меняется (догрузка секций, аккордеоны): пересчитываем.
// Сравниваем высоту, чтобы не реагировать на собственные pin-spacer'ы бесконечно.
if (typeof ResizeObserver !== 'undefined') {
	let lastHeight = 0;
	new ResizeObserver(([entry]) => {
		const h = Math.round(entry.contentRect.height);
		if (h === lastHeight) return;
		lastHeight = h;
		refreshSoon();
	}).observe(document.body);
}

registerRefresher(refreshSoon);
ScrollTrigger.addEventListener('refresh', emitRefreshed);

export { gsap, ScrollTrigger, useGSAP };
