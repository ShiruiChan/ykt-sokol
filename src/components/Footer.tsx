import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-gray-400 py-6 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Основная информация */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Логотип и краткое описание */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-white">YktSokol</h2>
            <p className="text-sm mt-1">Производство квадрациклов</p>
          </div>

          {/* Контактная информация */}
          <div className="text-center md:text-right">
            <p className="text-sm">+7 (914) 276-75-20</p>
            <p className="text-xs mt-1">© 2025 YktSokol. Все права защищены.</p>
          </div>
        </div>

        {/* Социальные сети - Пока скрыты*/}
        {/* <div className="mt-6 flex justify-center space-x-4">
          <a href="https://www.instagram.com/yktsokol/"  target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="https://2gis.com/yktsokol"  target="_blank" rel="noopener noreferrer" aria-label="VK">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M14.31 8.31l-1.42 1.42c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41l1.42-1.42c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41zM11 16h2v-2h-2v2z"></path>
            </svg>
          </a>
        </div> */}
      </div>
    </footer>
  );
}