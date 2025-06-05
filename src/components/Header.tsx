import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop header */}
      <header className="bg-dark text-white p-4 shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <a href="/"><h1 className="text-xl font-bold">YktSokol</h1></a>

          {/* Desktop nav */}
          <nav className="hidden md:block">
            <ul className="flex gap-6">
              <li><Link to="/" className="hover:text-orange-500 transition">Главная</Link></li>
              <li><Link to="/news" className="hover:text-orange-500 transition">Новости</Link></li>
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none"
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                // Close icon
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                // Menu icon
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-40">
            <div className="flex flex-col items-center justify-center h-full space-y-8 text-2xl">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-4 right-4"
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

              <Link
                to="/"
                className="hover:text-orange-500 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Главная
              </Link>
              <Link
                to="/news"
                className="hover:text-orange-500 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Новости
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </>
  );
}