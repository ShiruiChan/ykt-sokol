/**
 * Медиа-условия для gsap.matchMedia() и для хуков без gsap.
 * Брейкпоинт 768px совпадает с md: в Tailwind.
 */
const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export const MQ = {
	/** Десктоп: сложные сцены разрешены */
	desktop: `(min-width: 768px) and ${MOTION_OK}`,
	/** Пины: двухколоночная сетка (lg) и запиненный кадр помещается по высоте.
	 *  768–1023px: только появления, без пинов (одна колонка не влезает в экран). */
	pin: `(min-width: 1024px) and (min-height: 760px) and ${MOTION_OK}`,
	/** Телефон: только лёгкие появления */
	mobile: `(max-width: 767px) and ${MOTION_OK}`,
	/** Любое движение разрешено (без привязки к ширине) */
	motion: MOTION_OK,
	/** Пользователь просит без движения */
	reduce: '(prefers-reduced-motion: reduce)',
	/** Точный указатель: мышь/трекпад, не палец */
	fine: '(pointer: fine) and (hover: hover)',
} as const;

/** Условия разом, для mm.add(MQ_SET, (ctx) => ctx.conditions…) */
export const MQ_SET = {
	desktop: MQ.desktop,
	pin: MQ.pin,
	mobile: MQ.mobile,
	reduce: MQ.reduce,
};

export function matches(query: string) {
	return typeof window !== 'undefined' && window.matchMedia(query).matches;
}

/** Магнит и наклон: десктоп + мышь + движение разрешено */
export function canHoverFx() {
	return matches(`${MQ.desktop} and ${MQ.fine}`);
}
