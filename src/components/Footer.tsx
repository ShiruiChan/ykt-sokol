import { Link } from 'react-router-dom';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Clock, Phone, Pin, Telegram, WhatsApp } from './Icons';
import { ADDRESS, BRAND, HOURS, MESSENGERS, NAV, PHONES } from '../config/site';

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
								{BRAND}
							</span>
						</Link>
						<p className="mt-4 max-w-xs text-sm leading-relaxed text-fog-500">
							Производство снегоболотоходов 4×4 в Республике Саха (Якутия).
						</p>
						<div className="mt-6 flex gap-2">
							<a
								href={MESSENGERS.whatsapp}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Написать в WhatsApp"
								className="inline-grid h-10 w-10 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors hover:border-white/25 hover:text-fog-50"
							>
								<WhatsApp className="h-5 w-5" />
							</a>
							<a
								href={MESSENGERS.telegram}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Написать в Telegram"
								className="inline-grid h-10 w-10 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors hover:border-white/25 hover:text-fog-50"
							>
								<Telegram className="h-5 w-5" />
							</a>
						</div>
					</div>

					<nav aria-label="Разделы сайта">
						<h3 className="text-[11px] tracking-[0.2em] text-fog-500 uppercase">Разделы</h3>
						<ul className="mt-5 space-y-3 text-sm">
							{NAV.map((l) => (
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
									href={PHONES.main.href}
									className="tnum flex items-center gap-2.5 font-semibold text-fog-50 transition-colors hover:text-accent-200"
								>
									<Phone className="h-4 w-4 text-accent-400" />
									{PHONES.main.label}
								</a>
							</li>
							<li>
								<a
									href={PHONES.extra.href}
									className="tnum flex items-center gap-2.5 text-fog-400 transition-colors hover:text-fog-50"
								>
									<Phone className="h-4 w-4 opacity-0" />
									{PHONES.extra.label}
								</a>
							</li>
							<li className="flex items-start gap-2.5 text-fog-400">
								<Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
								{HOURS.label} (по Якутску)
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-[11px] tracking-[0.2em] text-fog-500 uppercase">Производство</h3>
						<a
							href={ADDRESS.routeUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-5 flex items-start gap-2.5 text-sm text-fog-400 transition-colors hover:text-fog-50"
						>
							<Pin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
							<span>
								{ADDRESS.city},
								<br />
								{ADDRESS.street}
							</span>
						</a>
					</div>
				</div>

				<div className="flex flex-col gap-3 border-t border-white/8 py-7 text-xs text-fog-500 sm:flex-row sm:items-center sm:justify-between">
					<p>
							© {YEAR} {BRAND}. Производство снегоболотоходов, Якутск.{' '}
							<Link to="/privacy" className="underline-offset-2 transition-colors hover:text-fog-50 hover:underline">
								Политика конфиденциальности
							</Link>
						</p>
					<p className="max-w-md sm:text-right">
						Информация на сайте не является публичной офертой. Характеристики могут
						изменяться производителем.
					</p>
				</div>
			</div>
		</footer>
	);
}
