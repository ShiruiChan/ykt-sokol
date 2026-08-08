/**
 * Заглушка секции на время подгрузки чанка. Повторяет форму будущего
 * контента (заголовок + сетка карточек), а не крутит абстрактный спиннер.
 */
export default function SectionSkeleton() {
	return (
		<div className="section bg-ink-950" aria-hidden>
			<div className="shell">
				<div className="skeleton h-3 w-40 rounded-full" />
				<div className="skeleton mt-6 h-10 w-72 max-w-full rounded-md" />
				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{[0, 1, 2].map((i) => (
						<div key={i} className="rounded-lg border border-white/7 bg-ink-850 p-5">
							<div className="skeleton aspect-[4/3] w-full rounded-md" />
							<div className="skeleton mt-5 h-3 w-full rounded-full" />
							<div className="skeleton mt-3 h-3 w-2/3 rounded-full" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
