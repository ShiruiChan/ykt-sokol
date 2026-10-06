/**
 * «Почему берут СОКОЛ».
 *  • ≥1024px и экран ≥760px по высоте: сетка запинивается на 150vh, четыре довода
 *    сменяют друг друга в одной «колоде» (стопка в одной ячейке грида),
 *    счётчик 01/04 и линия прогресса идут за скроллом, есть доводка к шагу.
 *  • остальной десктоп и телефон: доводы появляются каскадом.
 *  • reduced-motion: сцена не загружается, сетка 2×2 статична.
 */
import type { RefObject } from 'react';
import { gsap, useGSAP } from '../gsap';
import { MQ } from '../media';
import { batchReveal, splitReveal } from './shared';

interface Props {
	scope: RefObject<HTMLElement | null>;
}

export default function FeaturesScene({ scope }: Props) {
	useGSAP(
		() => {
			const root = scope.current;
			if (!root) return;
			const deck = root.querySelector<HTMLElement>('[data-feat-deck]');
			const stage = root.querySelector<HTMLElement>('[data-feat-stage]');
			const counter = root.querySelector<HTMLElement>('[data-feat-counter]');
			const cards = gsap.utils.toArray<HTMLElement>('[data-feat-card]', root);
			if (!deck || !stage || !cards.length) return;

			splitReveal(root);

			const mm = gsap.matchMedia();

			mm.add({ pin: MQ.pin, motion: MQ.motion }, (ctx) => {
				// Без пина: обычный каскад
				if (!ctx.conditions?.pin) {
					if (ctx.conditions?.motion) batchReveal(cards, { y: 32 });
					return;
				}

				// Раскладка «колодой» включается здесь и снимается при откате
				deck.dataset.scene = 'on';
				const steps = cards.length - 1;

				gsap.set(cards.slice(1), { autoAlpha: 0, yPercent: 24 });

				const tl = gsap.timeline({
					defaults: { ease: 'none' },
					scrollTrigger: {
						trigger: stage,
						start: 'center center+=40',
						end: '+=150%',
						pin: true,
						scrub: true,
						snap: { snapTo: 1 / steps, duration: { min: 0.2, max: 0.5 }, ease: 'power2.inOut' },
						onUpdate: (self) => {
							if (!counter) return;
							const i = Math.min(Math.round(self.progress * steps), steps);
							counter.textContent = String(i + 1).padStart(2, '0');
						},
					},
				});

				cards.slice(1).forEach((card, i) => {
					tl.to(cards[i], { autoAlpha: 0, yPercent: -18, duration: 1 }, i).to(
						card,
						{ autoAlpha: 1, yPercent: 0, duration: 1 },
						i
					);
				});
				tl.fromTo('[data-feat-progress]', { scaleX: 1 / cards.length }, { scaleX: 1, duration: steps }, 0);

				return () => {
					delete deck.dataset.scene;
					if (counter) counter.textContent = '01';
				};
			});

			return () => mm.revert();
		},
		{ scope }
	);

	return null;
}
