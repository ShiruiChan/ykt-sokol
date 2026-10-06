import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { onRefreshed, requestRefresh } from '../motion/refreshBus';

/**
 * Прокрутка при смене маршрута. Наверх уходим не сразу, а когда старая
 * страница доиграла exit (AnimatePresence → onExitComplete): иначе видно,
 * как гаснущая страница «уезжает». Сразу после этого просим ScrollTrigger
 * пересчитать позиции новой страницы.
 */
export function scrollToTop() {
	// Мгновенно: плавный скролл здесь мешает читать новую страницу
	window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
	requestRefresh();
}

function scrollToHash(hash: string) {
	const el = document.getElementById(decodeURIComponent(hash.slice(1)));
	el?.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
	return Boolean(el);
}

/**
 * Якоря вида /#catalog. Секции главной грузятся лениво, а пины сцен
 * добавляют высоту над ними уже после загрузки: ждём появления элемента
 * и доводим ещё раз после каждого пересчёта ScrollTrigger, пока
 * пользователь сам не начал скроллить (или не прошло 5 секунд).
 */
const ScrollToTop = () => {
	const { hash, key } = useLocation();

	useEffect(() => {
		if (!hash) return;

		const started = Date.now();
		let active = true;
		const stop = () => {
			active = false;
		};

		const poll = window.setInterval(() => {
			if (!active || Date.now() - started > 5000) return window.clearInterval(poll);
			if (scrollToHash(hash)) window.clearInterval(poll);
		}, 100);

		const off = onRefreshed(() => {
			if (active && Date.now() - started < 5000) scrollToHash(hash);
		});

		window.addEventListener('wheel', stop, { passive: true, once: true });
		window.addEventListener('touchstart', stop, { passive: true, once: true });
		window.addEventListener('keydown', stop, { once: true });

		return () => {
			stop();
			off();
			window.clearInterval(poll);
			window.removeEventListener('wheel', stop);
			window.removeEventListener('touchstart', stop);
			window.removeEventListener('keydown', stop);
		};
	}, [hash, key]);

	return null;
};

export default ScrollToTop;
