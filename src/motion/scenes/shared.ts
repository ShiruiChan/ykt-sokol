/** Общие кирпичики сцен. Вызываются внутри useGSAP / mm.add: всё откатывается с контекстом. */
import { gsap, ScrollTrigger } from '../gsap';
import { belowViewport } from '../useAfterLoad';
import { DUR, EASE, STAGGER } from '../tokens';

/** Каскадное появление пачками (ScrollTrigger.batch), один раз. */
export function batchReveal(targets: Element[], { y = 40, start = 'top 88%' } = {}) {
	const items = belowViewport(targets);
	if (!items.length) return;

	gsap.set(items, { autoAlpha: 0, y });
	ScrollTrigger.batch(items, {
		start,
		once: true,
		onEnter: (batch) =>
			gsap.to(batch, {
				autoAlpha: 1,
				y: 0,
				duration: DUR.base,
				ease: EASE.outExpo,
				stagger: STAGGER.items,
				overwrite: true,
			}),
	});
}

/** Слова заголовков с data-split="scroll" поднимаются из-под маски при входе. */
export function splitReveal(scope: Element) {
	belowViewport(Array.from(scope.querySelectorAll('[data-split="scroll"]'))).forEach((heading) => {
		gsap.from(heading.querySelectorAll('.split-word'), {
			yPercent: 108,
			duration: DUR.slow,
			ease: EASE.outExpo,
			stagger: STAGGER.words,
			scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
		});
	});
}
