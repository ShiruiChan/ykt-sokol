/**
 * Hero на скролле (только десктоп): кадр растёт 1 → 1.15, текст уходит вверх
 * и гаснет. Только transform/opacity, scrub. LCP-картинка видна сразу,
 * сцена подключается после загрузки страницы.
 */
import type { RefObject } from 'react';
import { gsap, useGSAP } from '../gsap';
import { MQ } from '../media';
import { SCRUB } from '../tokens';

interface Props {
	scope: RefObject<HTMLElement | null>;
}

export default function HeroScene({ scope }: Props) {
	useGSAP(
		() => {
			const mm = gsap.matchMedia();

			mm.add(MQ.desktop, () => {
				gsap
					.timeline({
						defaults: { ease: 'none' },
						scrollTrigger: {
							trigger: scope.current,
							start: 'top top',
							end: 'bottom top',
							scrub: SCRUB,
						},
					})
					.fromTo('[data-hero-image]', { scale: 1 }, { scale: 1.15 }, 0)
					.to('[data-hero-content]', { yPercent: -14, autoAlpha: 0, duration: 0.75 }, 0);
			});

			return () => mm.revert();
		},
		{ scope }
	);

	return null;
}
