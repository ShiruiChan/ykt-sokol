import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Phone } from './Icons';

const NAV = [
	{ to: '/', label: 'Главная' },
	{ to: '/news', label: 'Новости' },
	{ to: '/gallery', label: 'Галерея' },
	{ to: '/cert', label: 'Документы' },
];

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const openRequest = useRequestModal((s) => s.open);
	const { pathname } = useLocation();
	const reduce = useReducedMotion();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	// Меню закрывается при переходе и блокирует скролл фона
	useEffect(() => setIsMenuOpen(false), [pathname]);

	useEffect(() => {
		if (!isMenuOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false);
		document.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = prev;
			document.removeEventListener('keydown', onKey);
		};
	}, [isMenuOpen]);

	return (
		<>
			<a
				href="#main"
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-95 focus:rounded-full focus:bg-accent-500 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
			>
				Перейти к содержимому
			</a>

			<header className="fixed inset-x-0 top-0 z-60 pt-3 md:pt-5">
				<div className="shell">
					<div
						className={`flex items-center gap-3 rounded-full border px-3 py-2.5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:px-4 ${
							scrolled
								? 'border-white/10 bg-ink-950/75 shadow-plate backdrop-blur-xl'
								: 'border-transparent bg-ink-950/25 backdrop-blur-sm'
						}`}
					>
						{/* Марка */}
						<Link
							to="/"
							className="group flex shrink-0 items-center gap-2.5"
							aria-label="ЯКТ СОКОЛ — на главную"
						>
							<img
								src="/logo.webp"
								alt=""
								width={36}
								height={36}
								className="h-9 w-9 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
							/>
							<span className="font-display text-lg leading-none tracking-[0.06em] text-fog-50 md:text-xl">
								ЯКТ СОКОЛ
							</span>
						</Link>

						{/* Навигация */}
						<nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Основная">
							{NAV.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									end={item.to === '/'}
									className={({ isActive }) =>
										`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
											isActive
												? 'text-fog-50'
												: 'text-fog-400 hover:text-fog-50'
										}`
									}
								>
									{({ isActive }) => (
										<>
											{isActive && (
												<motion.span
													layoutId="nav-pill"
													className="absolute inset-0 rounded-full bg-white/8"
													transition={{ duration: reduce ? 0 : 0.45, ease: [0.32, 0.72, 0, 1] }}
												/>
											)}
											<span className="relative">{item.label}</span>
										</>
									)}
								</NavLink>
							))}
						</nav>

						{/* Телефон + заявка */}
						<div className="ml-auto flex items-center gap-2 md:ml-2">
							<a
								href="tel:+79969141414"
								className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-fog-50 transition-colors duration-300 hover:border-white/25 hover:bg-white/6 lg:inline-flex"
							>
								<Phone className="h-4 w-4 text-accent-400" />
								<span className="tnum">+7 (996) 914-14-14</span>
							</a>

							<button
								type="button"
								onClick={() => openRequest()}
								className="btn btn-primary hidden py-2.5 pr-2.5 pl-5 text-sm md:inline-flex"
							>
								Заявка
								<span className="btn-dot h-7 w-7">
									<ArrowUpRight className="h-3.5 w-3.5" />
								</span>
							</button>

							{/* Гамбургер, превращающийся в крест */}
							<button
								type="button"
								onClick={() => setIsMenuOpen((v) => !v)}
								className="relative z-90 grid h-11 w-11 place-items-center rounded-full border border-white/10 text-fog-50 transition-colors hover:bg-white/6 md:hidden"
								aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
								aria-expanded={isMenuOpen}
							>
								<span className="relative block h-4 w-5">
									<span
										className={`absolute left-0 block h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
											isMenuOpen ? 'top-2 rotate-45' : 'top-0.5'
										}`}
									/>
									<span
										className={`absolute left-0 block h-px w-5 bg-current transition-all duration-300 ${
											isMenuOpen ? 'top-2 opacity-0' : 'top-2 opacity-100'
										}`}
									/>
									<span
										className={`absolute left-0 block h-px w-5 bg-current transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
											isMenuOpen ? 'top-2 -rotate-45' : 'top-3.5'
										}`}
									/>
								</span>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Полноэкранное мобильное меню с каскадом ссылок */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						className="fixed inset-0 z-55 flex flex-col bg-ink-950/96 backdrop-blur-2xl md:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: reduce ? 0 : 0.3 }}
					>
						<nav className="mt-28 flex flex-1 flex-col gap-1 px-6" aria-label="Мобильная">
							{NAV.map((item, i) => (
								<motion.div
									key={item.to}
									initial={reduce ? false : { opacity: 0, y: 24 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.06 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
								>
									<NavLink
										to={item.to}
										end={item.to === '/'}
										onClick={() => setIsMenuOpen(false)}
										className={({ isActive }) =>
											`flex items-baseline justify-between border-b border-white/8 py-5 font-display text-3xl tracking-[0.02em] uppercase transition-colors ${
												isActive ? 'text-accent-200' : 'text-fog-50'
											}`
										}
									>
										{item.label}
										<span className="font-sans text-xs tracking-[0.2em] text-fog-500">
											0{i + 1}
										</span>
									</NavLink>
								</motion.div>
							))}
						</nav>

						<motion.div
							className="space-y-3 px-6 pb-10"
							initial={reduce ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.32, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
						>
							<button
								type="button"
								onClick={() => {
									setIsMenuOpen(false);
									openRequest();
								}}
								className="btn btn-primary w-full"
							>
								Оставить заявку
								<span className="btn-dot">
									<ArrowUpRight className="h-4 w-4" />
								</span>
							</button>
							<a href="tel:+79969141414" className="btn btn-ghost w-full">
								<Phone className="h-4 w-4 text-accent-400" />
								<span className="tnum">+7 (996) 914-14-14</span>
							</a>
							<p className="pt-2 text-center text-xs text-fog-500">
								г. Якутск, ул. Чусовского, 75/3 · ежедневно 9:00–18:00
							</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
