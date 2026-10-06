/**
 * 3D-наклон за курсором и блик. Только (pointer: fine), десктоп, без reduced-motion.
 * Пишет CSS-переменные (--rx, --ry, --gx, --gy, --ga) в rAF; трансформ и блик
 * собираются в CSS (.tilt / .tilt-glare в index.css). Без библиотек.
 */
import { useEffect, useRef } from 'react';
import { canHoverFx } from './media';

const MAX_DEG = 6;

export function useTilt<T extends HTMLElement>() {
	const ref = useRef<T>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || !canHoverFx()) return;

		let raf = 0;
		let rect: DOMRect | null = null;

		const onEnter = () => {
			rect = el.getBoundingClientRect();
			el.dataset.tilt = 'on';
		};
		const onMove = (e: PointerEvent) => {
			if (!rect) rect = el.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				el.style.setProperty('--ry', `${((x - 0.5) * 2 * MAX_DEG).toFixed(2)}deg`);
				el.style.setProperty('--rx', `${((0.5 - y) * 2 * MAX_DEG).toFixed(2)}deg`);
				el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
				el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
			});
		};
		const onLeave = () => {
			cancelAnimationFrame(raf);
			rect = null;
			delete el.dataset.tilt;
			el.style.setProperty('--rx', '0deg');
			el.style.setProperty('--ry', '0deg');
		};

		el.addEventListener('pointerenter', onEnter);
		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerleave', onLeave);
		return () => {
			cancelAnimationFrame(raf);
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerleave', onLeave);
		};
	}, []);

	return ref;
}
