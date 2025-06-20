import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Отслеживаем скролл
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`${
          scrolled
            ? 'bg-neutral-900/70 backdrop-blur-md border-gray-700/50'
            : 'bg-neutral-950 border-gray-800'
        } text-gray-100 p-4 shadow-lg fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300`}
      >
        <div className="container mx-auto flex items-center relative py-2 md:py-0">
          <a href="/" className='left-0 absolute'>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-100 hover:text-gray-300 transition">
              YktSokol
            </h1>
          </a>
					{/* Телефон по центру */}
					<a
						href="tel:+79149941414"
						className="hidden md:block transition text-xl font-bold mx-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl border-b-4 border-green-700"
						onClick={() => setIsMenuOpen(false)}
					>+7 (914) 994-14-14
					</a>

          <nav className="hidden md:block right-0 absolute">
            <ul className="flex gap-8">
              <li>
                <Link
                  to="/"
                  className="text-lg font-semibold hover:text-gray-300 transition"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-lg font-semibold hover:text-gray-300 transition"
                >
                  Новости
                </Link>
              </li>
            </ul>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none right-0 absolute"
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
            >
              {isMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-gray-900/90 z-40 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center h-full space-y-10 text-3xl font-bold">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4"
                aria-label="Закрыть меню"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
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

              <Link
                to="/"
                className="hover:text-gray-300 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
              <Link
                to="/news"
                className="hover:text-gray-300 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Новости
              </Link>

              {/* Телефон по центру */}
              <a
                href="tel:+79149941414"
                className="text-green-400 hover:text-green-300 transition text-xl font-bold mt-8"
                onClick={() => setIsMenuOpen(false)}
              >
                +7 (914) 994-14-14
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Overlay для закрытия меню на мобильных устройствах */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}