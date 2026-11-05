import React from 'react';
import { PHONE } from '../config/site';

/**
 * Страховка от белого экрана. Две причины:
 * 1. После публикации из админки Vercel выкатывает новую сборку, и у
 *    открытой вкладки старые чанки страниц пропадают (404) — тогда
 *    один раз тихо перезагружаем страницу, она подтянет свежую сборку.
 * 2. Любая ошибка рендера — показываем сообщение с телефоном вместо
 *    пустого экрана; шапка и подвал остаются на месте.
 */

const RELOAD_KEY = 'ykt:chunk-reload';

const isChunkError = (error: unknown) =>
	error instanceof Error &&
	/dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk/i.test(
		`${error.name} ${error.message}`,
	);

interface Props {
	children: React.ReactNode;
}

interface State {
	error: unknown;
}

export default class ErrorBoundary extends React.Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: unknown): State {
		return { error };
	}

	componentDidCatch(error: unknown) {
		if (isChunkError(error) && typeof window !== 'undefined') {
			// Перезагружаем не чаще раза в минуту, чтобы не уйти в цикл при настоящем сбое сети
			const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
			if (Date.now() - last > 60_000) {
				sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
				window.location.reload();
				return;
			}
		}
		console.error(error);
	}

	render() {
		if (!this.state.error) return this.props.children;
		return (
			<div
				role="alert"
				className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-start justify-center gap-5 px-6 py-24"
			>
				<h1 className="text-2xl font-semibold text-fog-50">Страница не загрузилась</h1>
				<p className="text-fog-400">
					Скорее всего, сайт только что обновился или прервалась связь. Обновите страницу — если не
					поможет, позвоните, расскажем всё по телефону.
				</p>
				<div className="flex flex-wrap gap-3">
					<button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
						Обновить страницу
					</button>
					<a href={PHONE.href} className="btn btn-ghost tnum">
						{PHONE.label}
					</a>
				</div>
			</div>
		);
	}
}
