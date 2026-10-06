/**
 * Галерея: кадр открывается шторкой clip-path (inset 100% → 0), один раз.
 * На десктопе снимок внутри рамки ещё и плывёт (параллакс yPercent, scrub).
 * Перезапускается при «Показать ещё»: уже открытые кадры помечены и не прячутся снова.
 */
import type { RefObject } from 'react';
import { gsap, useGSAP } from '../gsap';
import { MQ } from '../media';
import { DUR, EASE } from '../tokens';
import { belowViewport } from '../useAfterLoad';

interface Props {
	scope: RefObject<HTMLElement | null>;
	/** Сколько кадров сейчас в сетке: смена числа пересобирает сцену */
	count: number;
}

const HIDDEN = 'inset(100% 0% 0% 0%)';
const SHOWN = 'inset(0% 0% 0% 0%)';

export default function GalleryScene({ scope, count }: Props) {
	useGSAP(
		() => {
			const root = scope.current;
			if (!root) return;

			const mm = gsap.matchMedia();
			mm.add({ desktop: MQ.desktop, motion: MQ.motion }, (ctx) => {
				if (!ctx.conditions?.motion) return;

				const frames = gsap.utils.toArray<HTMLElement>('[data-gal-frame]', root);
				const fresh = belowViewport(frames.filter((f) => !f.dataset.revealed));

				fresh.forEach((frame) => {
					gsap.set(frame, { clipPath: HIDDEN });
					gsap.to(frame, {
						clipPath: SHOWN,
						duration: DUR.slow,
						ease: EASE.outExpo,
						scrollTrigger: {
							trigger: frame,
							start: 'top 92%',
							once: true,
							onEnter: () => {
								frame.dataset.revealed = '1';
							},
						},
					});
				});

				if (!ctx.conditions.desktop) return;

				frames.forEach((frame) => {
					const layer = frame.querySelector('[data-gal-parallax]');
					if (!layer) return;
					gsap.fromTo(
						layer,
						{ yPercent: -5, scale: 1.12 },
						{
							yPercent: 5,
							ease: 'none',
							scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
						}
					);
				});
			});

			return () => mm.revert();
		},
		{ scope, dependencies: [count], revertOnUpdate: true }
	);

	return null;
}
