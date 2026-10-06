/**
 * Магнитная кнопка: лёгкое притяжение к курсору, не дальше 8px.
 * Двигаем через CSS-свойство `translate`, а не `transform`: у .btn уже есть
 * transform: scale() на :active, отдельные свойства складываются без конфликта.
 * Только десктоп с мышью и без reduced-motion.
 */
import { useEffect, useRef } from 'react';
import { canHoverFx } from './media';

const MAX_PX = 8;
const STRENGTH = 0.3;

export function useMagnetic<T extends HTMLElement>() {
	const ref = useRef<T>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || !canHoverFx()) return;

		let raf = 0;
		const clamp = (v: number) => Math.max(-MAX_PX, Math.min(MAX_PX, v));

		const onMove = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			const dx = clamp((e.clientX - (r.left + r.width / 2)) * STRENGTH);
			const dy = clamp((e.clientY - (r.top + r.height / 2)) * STRENGTH);
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				el.style.translate = `${dx.toFixed(2)}px ${dy.toFixed(2)}px`;
			});
		};
		const onLeave = () => {
			cancelAnimationFrame(raf);
			el.style.translate = '';
		};

		el.classList.add('magnetic');
		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerleave', onLeave);
		return () => {
			cancelAnimationFrame(raf);
			el.classList.remove('magnetic');
			el.style.translate = '';
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerleave', onLeave);
		};
	}, []);

	return ref;
}
