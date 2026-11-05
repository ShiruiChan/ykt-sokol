/**
 * Ожидание загрузки маршрута. Вместо крутящегося колечка — спокойная
 * марка и «дышащая» полоса прогресса в фирменном цвете.
 */
// Высота на весь экран: иначе подвал на время загрузки поднимается под шапку,
// а потом его сталкивает вниз пришедшая страница — это заметный сдвиг вёрстки (CLS)
export default function LoadingSpinner() {
	return (
		<div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-ink-950">
			<img src="/logo.webp" alt="" width={48} height={48} className="h-12 w-12 opacity-80" />
			<div className="h-px w-40 overflow-hidden bg-white/10">
				<div className="skeleton h-full w-full" />
			</div>
			<p className="text-xs tracking-[0.24em] text-fog-500 uppercase">загрузка</p>
		</div>
	);
}
