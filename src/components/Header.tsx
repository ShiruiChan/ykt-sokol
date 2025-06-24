import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// Отслеживание скролла
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 0);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<>
			<header
				className={`${scrolled
					? 'bg-neutral-900/70 backdrop-blur-md border-gray-700'
					: 'bg-neutral-950 border-gray-800'
					} text-gray-100 px-4 py-4 shadow-lg fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300`}
			>
				<div className="container mx-auto flex items-center justify-between relative">
					{/* Логотип */}
					<a href="/" className="text-left z-10 flex gap-x-2 items-center">
						<img src="/logo.png" alt="" className='w-10 h-10' />
						<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text hover:opacity-90 transition">
							ЯКТСокол
						</h1>
					</a>

					{/* Телефон (на десктопе по центру) */}
					<a
						href="tel:+79149941414"
						className="hidden md:block absolute left-1/2 transform -translate-x-1/2 text-xl font-bold px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full border-b-4 border-green-700 shadow-lg hover:shadow-green-500/30 transition-transform hover:-translate-y-0.5 active:translate-y-0"
						onClick={() => setIsMenuOpen(false)}
					>
						+7 (996) 914 14 14
					</a>

					{/* Навигация на десктопе */}
					<nav className="hidden md:flex items-center space-x-10 z-10">
						<Link
							to="/"
							className="text-lg font-semibold text-gray-200 hover:text-white transition-colors duration-200"
						>
							Главная
						</Link>
						<Link
							to="/news"
							className="text-lg font-semibold text-gray-200 hover:text-white transition-colors duration-200"
						>
							Новости
						</Link>
						<Link
							to="/gallery"
							className="text-lg font-semibold text-gray-200 hover:text-white transition-colors duration-200"
						>
							Галлерея
						</Link>
					</nav>

					{/* Мобильная кнопка меню */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden z-20 focus:outline-none"
						aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-gray-100 hover:text-white transition"
						>
							{isMenuOpen ? (
								<path d="M18 6L6 18M6 6l12 12" />
							) : (
								<path d="M3 12h18M3 6h18M3 18h18" />
							)}
						</svg>
					</button>
				</div>
			</header>

			{/* Мобильное меню */}
			{isMenuOpen && (
				<>
					<div
						className="fixed inset-0 bg-gray-950/95 z-40 backdrop-blur-sm flex items-center justify-center p-8"
						style={{ animation: 'fadeIn 0.3s ease-in-out forwards' }}
					>
						<div
							className="w-full max-w-xs text-center animate-fadeInUp"
							style={{
								animation: 'slideUp 0.4s ease-in-out forwards',
							}}
						>
							<button
								onClick={() => setIsMenuOpen(false)}
								className="absolute top-6 right-6"
								aria-label="Закрыть меню"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="32"
									height="32"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							</button>

							<nav className="flex flex-col items-center gap-8 mt-10">
								<Link
									to="/"
									className="text-2xl font-bold text-white hover:text-green-400 transition"
									onClick={() => setIsMenuOpen(false)}
								>
									Главная
								</Link>
								<Link
									to="/news"
									className="text-2xl font-bold text-white hover:text-green-400 transition"
									onClick={() => setIsMenuOpen(false)}
								>
									Новости
								</Link>
								<Link
									to="/gallery"
									className="text-2xl font-bold text-white hover:text-green-400 transition"
									onClick={() => setIsMenuOpen(false)}
								>
									Галлерея
								</Link>
							</nav>

							{/* Телефон внизу мобильного меню */}
							<a
								href="tel:+79969141414"
								className="mt-12 inline-block text-xl font-bold text-green-400 hover:text-green-300 transition"
								onClick={() => setIsMenuOpen(false)}
							>
								+7 (996) 914 14 14
							</a>
						</div>
					</div>

					{/* Overlay для закрытия */}
					<div
						className="fixed inset-0 bg-black/40 z-30 md:hidden"
						onClick={() => setIsMenuOpen(false)}
					></div>
				</>
			)}
		</>
	);
}