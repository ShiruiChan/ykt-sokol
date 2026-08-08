import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowUpRight } from '../components/Icons';

const ROUTES = [
	{ to: '/', label: 'Главная', hint: 'модели и цены' },
	{ to: '/gallery', label: 'Галерея', hint: '65 кадров с испытаний' },
	{ to: '/news', label: 'Новости', hint: 'что происходит в цехе' },
	{ to: '/cert', label: 'Документы', hint: 'сертификаты и ПСМ' },
];

export default function NotFound() {
	return (
		<>
			<Header />

			<main
				id="main"
				className="relative flex flex-1 items-center overflow-hidden bg-ink-950 pt-32 pb-20 md:pt-40"
			>
				{/* Тот же кадр, что и на первом экране — страница не выпадает из мира сайта */}
				<img
					src="/images/lis/1.webp"
					alt=""
					aria-hidden
					className="absolute inset-0 h-full w-full object-cover opacity-15"
					loading="lazy"
					decoding="async"
				/>
				<div
					aria-hidden
					className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(8,10,10,0.55)_0%,var(--color-ink-950)_75%)]"
				/>

				<div className="shell relative">
					<div className="max-w-2xl">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							ошибка 404
						</p>
						<p className="tnum mt-6 font-display text-display leading-none text-fog-50">404</p>
						<h1 className="mt-6 text-heading text-fog-50">
							Дальше дороги нет — страница не найдена
						</h1>
						<p className="mt-4 max-w-md text-fog-400">
							Возможно, адрес набран с опечаткой или раздел переехал. Ниже — куда можно
							свернуть.
						</p>

						<Link to="/" className="btn btn-primary mt-9">
							Вернуться на главную
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</Link>
					</div>

					<nav aria-label="Основные разделы" className="mt-14 border-t border-white/8">
						{ROUTES.map((r) => (
							<Link
								key={r.to}
								to={r.to}
								className="group flex items-center justify-between gap-6 border-b border-white/8 py-5 transition-colors hover:bg-white/3"
							>
								<span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
									<span className="font-display text-lg tracking-wide text-fog-50 uppercase">
										{r.label}
									</span>
									<span className="text-sm text-fog-500">{r.hint}</span>
								</span>
								<span className="btn-dot bg-white/8 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
									<ArrowUpRight className="h-4 w-4 text-fog-50" />
								</span>
							</Link>
						))}
					</nav>
				</div>
			</main>

			<Footer />
		</>
	);
}
