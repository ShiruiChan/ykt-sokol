import { Link } from 'react-router-dom';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Clock, Instagram, Phone, Pin } from './Icons';

const YEAR = new Date().getFullYear();

export default function Footer() {
	const openRequest = useRequestModal((s) => s.open);

	return (
		<footer className="mt-auto border-t border-white/8 bg-ink-950">
			{/* Финальный призыв — последний шанс на контакт */}
			<div className="shell">
				<div className="flex flex-col gap-7 border-b border-white/8 py-14 md:flex-row md:items-center md:justify-between md:py-16">
					<div>
						<h2 className="max-w-lg text-heading text-fog-50">
							Подберём машину под ваш маршрут
						</h2>
						<p className="mt-3 max-w-md text-sm text-fog-400">
							Расскажите, где и что возите — предложим модель, шины и комплектацию.
							Ответим в тот же день.
						</p>
					</div>
					<button type="button" onClick={() => openRequest()} className="btn btn-primary shrink-0">
						Оставить заявку
						<span className="btn-dot">
							<ArrowUpRight className="h-4 w-4" />
						</span>
					</button>
				</div>

				<div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
					<div className="sm:col-span-2 lg:col-span-1">
						<Link to="/" className="flex items-center gap-2.5">
							<img src="/logo.webp" alt="" width={36} height={36} className="h-9 w-9" loading="lazy" />
							<span className="font-display text-lg tracking-[0.06em] text-fog-50">
								ЯКТ СОКОЛ
							</span>
						</Link>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-fog-500">
							Производство снегоболотоходов 4×4 в Республике Саха (Якутия).
						</p>
						<a
							href="https://www.instagram.com/yktsokol/"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram ЯКТ СОКОЛ"
							className="mt-6 inline-grid h-10 w-10 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors hover:border-white/25 hover:text-fog-50"
						>
							<Instagram className="h-5 w-5" />
						</a>
					</div>

					<nav aria-label="Разделы сайта">
						<h3 className="text-[11px] tracking-[0.2em] text-fog-500 uppercase">Разделы</h3>
						<ul className="mt-5 space-y-3 text-sm">
							{[
								{ to: '/', label: 'Главная' },
								{ to: '/news', label: 'Новости' },
								{ to: '/gallery', label: 'Галерея' },
								{ to: '/cert', label: 'Документы' },
							].map((l) => (
								<li key={l.to}>
									<Link to={l.to} className="text-fog-400 transition-colors hover:text-fog-50">
										{l.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					<div>
						<h3 className="text-[11px] tracking-[0.2em] text-fog-500 uppercase">Контакты</h3>
						<ul className="mt-5 space-y-4 text-sm">
							<li>
								<a
									href="tel:+79969141414"
									className="tnum flex items-center gap-2.5 font-semibold text-fog-50 transition-colors hover:text-accent-200"
								>
									<Phone className="h-4 w-4 text-accent-400" />
									+7 (996) 914-14-14
								</a>
							</li>
							<li>
								<a
									href="tel:+79142767520"
									className="tnum flex items-center gap-2.5 text-fog-400 transition-colors hover:text-fog-50"
								>
									<Phone className="h-4 w-4 opacity-0" />
									+7 (914) 276-75-20
								</a>
							</li>
							<li className="flex items-start gap-2.5 text-fog-400">
								<Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
								Ежедневно, 9:00–18:00 (YAKT)
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-[11px] tracking-[0.2em] text-fog-500 uppercase">Производство</h3>
						<a
							href="https://2gis.ru/yakutsk/search/%D0%A7%D1%83%D1%81%D0%BE%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE%2075%2F3"
							target="_blank"
							rel="noopener noreferrer"
							className="mt-5 flex items-start gap-2.5 text-sm text-fog-400 transition-colors hover:text-fog-50"
						>
							<Pin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
							<span>
								г. Якутск,
								<br />
								ул. Чусовского, 75/3
							</span>
						</a>
					</div>
				</div>

				<div className="flex flex-col gap-3 border-t border-white/8 py-7 text-xs text-fog-500 sm:flex-row sm:items-center sm:justify-between">
					<p>© {YEAR} ЯКТ СОКОЛ. Производство снегоболотоходов, Якутск.</p>
					<p className="max-w-md sm:text-right">
						Информация на сайте не является публичной офертой. Характеристики могут
						изменяться производителем.
					</p>
				</div>
			</div>
		</footer>
	);
}
