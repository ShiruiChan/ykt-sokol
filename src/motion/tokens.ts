/**
 * Токены движения. Совпадают с кривыми из src/index.css:
 *   --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)  → gsap 'expo.out'
 *   --ease-spring:   cubic-bezier(0.32, 0.72, 0, 1) → gsap 'power3.out' (ближайшая)
 * Массивы нужны framer-motion, строки: gsap.
 */
export const EASE = {
	outExpo: 'expo.out',
	spring: 'power3.out',
	/** scrub-сцены идут линейно: кривую задаёт сам скролл */
	scrub: 'none',
} as const;

export const BEZIER = {
	outExpo: [0.16, 1, 0.3, 1] as const,
	spring: [0.32, 0.72, 0, 1] as const,
};

/** Длительности, сек */
export const DUR = {
	fast: 0.35,
	base: 0.8,
	slow: 1.1,
} as const;

/** Шаг каскада, сек */
export const STAGGER = {
	words: 0.06,
	items: 0.08,
} as const;

/** Сглаживание scrub: true = жёстко к скроллу, число = догоняет за N сек */
export const SCRUB = 0.6;
