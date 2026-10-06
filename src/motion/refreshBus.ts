/**
 * Мост между App и gsap без статического импорта gsap.
 * gsap.ts регистрирует здесь свой пересчёт, App просит его после смены
 * маршрута. Если gsap на странице ещё не загружен, просить нечего: no-op.
 */
type Fn = () => void;

let refresher: Fn | null = null;
const listeners = new Set<Fn>();

export function registerRefresher(fn: Fn) {
	refresher = fn;
}

export function requestRefresh() {
	refresher?.();
}

/** Подписка на «ScrollTrigger пересчитал позиции» */
export function onRefreshed(fn: Fn) {
	listeners.add(fn);
	return () => {
		listeners.delete(fn);
	};
}

export function emitRefreshed() {
	listeners.forEach((fn) => fn());
}
