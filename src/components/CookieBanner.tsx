/**
 * Баннер о cookie. Показывается, только если на сайте подключена
 * Яндекс.Метрика (VITE_YM_ID): других необязательных cookie у сайта нет.
 * Кнопки равного веса — отказаться так же просто, как согласиться.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '../utils/cookieConsent';
import { YM_ENABLED } from './Metrika';

export default function CookieBanner() {
	const { open, hydrate, choose } = useCookieConsent();

	// Только в браузере: при пререндере localStorage нет, баннер не рендерим
	useEffect(() => {
		if (YM_ENABLED) hydrate();
	}, [hydrate]);

	if (!YM_ENABLED || !open) return null;

	return (
		<div
			role="dialog"
			aria-modal="false"
			aria-labelledby="cookie-title"
			className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-2xl rounded-md border border-white/12 bg-ink-850/97 p-5 shadow-plate backdrop-blur-xl sm:p-6"
		>
			<p id="cookie-title" className="text-sm font-semibold text-fog-50">
				Cookie и статистика
			</p>
			<p className="mt-2 text-sm leading-relaxed text-fog-300">
				Мы хотим включить Яндекс.Метрику, чтобы понимать, как люди пользуются сайтом. Она
				использует cookie и собирает технические данные. Без вашего разрешения она не
				загружается.{' '}
				<Link to="/privacy" className="text-fog-100 underline decoration-fog-500/50 underline-offset-2 hover:text-fog-50">
					Подробнее
				</Link>
			</p>
			<div className="mt-4 grid gap-2 sm:grid-cols-2">
				<button type="button" onClick={() => choose('granted')} className="btn btn-rect btn-ghost w-full py-3">
					Разрешить
				</button>
				<button type="button" onClick={() => choose('denied')} className="btn btn-rect btn-ghost w-full py-3">
					Только необходимые
				</button>
			</div>
		</div>
	);
}
