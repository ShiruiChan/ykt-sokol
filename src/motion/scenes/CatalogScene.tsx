/**
 * Каталог: карточки въезжают пачками (ScrollTrigger.batch) на любом экране,
 * заголовок поднимается по словам. Наклон и блик живут в ProductCard (useTilt),
 * на другом элементе: библиотеки не пересекаются.
 */
import type { RefObject } from 'react';
import { gsap, useGSAP } from '../gsap';
import { MQ } from '../media';
import { batchReveal, splitReveal } from './shared';

interface Props {
	scope: RefObject<HTMLElement | null>;
}

export default function CatalogScene({ scope }: Props) {
	useGSAP(
		() => {
			const root = scope.current;
			if (!root) return;

			const mm = gsap.matchMedia();
			mm.add({ desktop: MQ.desktop, motion: MQ.motion }, (ctx) => {
				if (!ctx.conditions?.motion) return;
				splitReveal(root);
				batchReveal(gsap.utils.toArray<HTMLElement>('[data-cat-card]', root), {
					// На телефоне короче путь: лёгкое появление
					y: ctx.conditions.desktop ? 72 : 32,
				});
			});

			return () => mm.revert();
		},
		{ scope }
	);

	return null;
}
