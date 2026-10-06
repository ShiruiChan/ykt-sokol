/**
 * «Как купить».
 *  • ≥1024px и экран ≥760px: секция запинивается, шаги едут лентой по горизонтали
 *    (translateX по scrub), линия прогресса над лентой растёт через scaleX,
 *    шаги проявляются по мере подхода к центру (containerAnimation).
 *  • остальной десктоп и телефон: обычный список с каскадом.
 *  • reduced-motion: сцена не загружается, сетка статична.
 */
import type { RefObject } from 'react';
import { gsap, useGSAP } from '../gsap';
import { MQ } from '../media';
import { batchReveal, splitReveal } from './shared';

interface Props {
	scope: RefObject<HTMLElement | null>;
}

export default function BuyStepsScene({ scope }: Props) {
	useGSAP(
		() => {
			const root = scope.current;
			if (!root) return;
			const stage = root.querySelector<HTMLElement>('[data-steps-stage]');
			const track = root.querySelector<HTMLElement>('[data-steps-track]');
			const steps = gsap.utils.toArray<HTMLElement>('[data-step]', root);
			if (!stage || !track || !steps.length) return;

			splitReveal(root);

			const mm = gsap.matchMedia();

			mm.add({ pin: MQ.pin, motion: MQ.motion }, (ctx) => {
				if (!ctx.conditions?.pin) {
					if (ctx.conditions?.motion) batchReveal(steps, { y: 32 });
					return;
				}

				stage.dataset.scene = 'on';

				// Сколько ленты не помещается в контейнер: столько и проезжаем
				const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

				const move = gsap.to(track, {
					x: () => -distance(),
					ease: 'none',
					scrollTrigger: {
						trigger: stage,
						start: 'center center+=40',
						end: () => `+=${distance() * 1.25}`,
						pin: true,
						scrub: true,
						invalidateOnRefresh: true,
					},
				});

				gsap.fromTo(
					'[data-steps-progress]',
					{ scaleX: 0 },
					{
						scaleX: 1,
						ease: 'none',
						scrollTrigger: {
							trigger: stage,
							start: 'center center+=40',
							end: () => `+=${distance() * 1.25}`,
							scrub: true,
							invalidateOnRefresh: true,
						},
					}
				);

				// Шаги за краем приглушены и «доезжают» до полной яркости к центру экрана
				steps.slice(1).forEach((step) => {
					gsap.fromTo(
						step,
						{ autoAlpha: 0.35 },
						{
							autoAlpha: 1,
							ease: 'none',
							scrollTrigger: {
								trigger: step,
								containerAnimation: move,
								start: 'left 90%',
								end: 'left 55%',
								scrub: true,
							},
						}
					);
				});

				return () => {
					delete stage.dataset.scene;
				};
			});

			return () => mm.revert();
		},
		{ scope }
	);

	return null;
}
