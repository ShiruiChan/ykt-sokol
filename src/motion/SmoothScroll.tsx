/**
 * Плавный скролл Lenis. Подключается лениво и только там, где он уместен:
 * десктоп, мышь/трекпад (pointer: fine), без prefers-reduced-motion.
 * На тач-устройствах не создаётся вовсе: там нативная прокрутка лучше.
 *
 * Совместимость:
 *  • скроллит нативное окно, поэтому position: sticky, MobileCta, ScrollTrigger
 *    и scrollIntoView работают как раньше (gsap для этого не нужен);
 *  • модалка и мобильное меню блокируют фон через body.style.overflow:
 *    следим за этим и ставим Lenis на паузу, иначе страница ехала бы под модалкой;
 *  • лайтбокс react-photo-view и элементы с data-lenis-prevent прокручиваются сами;
 *  • якоря <a href="#…"> ведёт сам Lenis (anchors).
 */
import { useEffect } from 'react';
import Lenis from 'lenis';
import { canHoverFx } from './media';

export default function SmoothScroll() {
	useEffect(() => {
		if (!canHoverFx()) return;

		const lenis = new Lenis({
			autoRaf: true,
			lerp: 0.12,
			anchors: { offset: -96 },
			allowNestedScroll: true,
			stopInertiaOnNavigate: true,
			prevent: (node) => Boolean(node.closest?.('.PhotoView-Portal, [role="dialog"]')),
		});

		const sync = () => {
			if (document.body.style.overflow === 'hidden') lenis.stop();
			else lenis.start();
		};
		const mo = new MutationObserver(sync);
		mo.observe(document.body, { attributes: true, attributeFilter: ['style'] });
		sync();

		return () => {
			mo.disconnect();
			lenis.destroy();
		};
	}, []);

	return null;
}
