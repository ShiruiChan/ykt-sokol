import { useState, useEffect } from 'react';

export default function Features() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's 'sm' breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalog');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-neutral-800 text-white py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-12 sm:mb-16 text-center leading-tight">
          Почему нас выбирают клиенты?
        </h2>
        <p className="text-center text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Мы стремимся создавать продукты, которые радуют надёжностью, комфортом и вниманием к деталям.
        </p>
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative bg-neutral-900/40 rounded-xl p-6 sm:p-8 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="text-5xl sm:text-6xl mb-4 animate-pulse">🛞</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Высокая проходимость</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Прочный каркас и колеса с увеличенным рисунком протектора обеспечивают уверенное поведение даже на сложных участках.
            </p>
            <div className={`mt-4 text-gray-400 text-sm transition-all duration-300 ${isMobile || isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p>Специальная конструкция рамы и использование износостойких материалов делают наши модели стабильными в самых разных условиях.</p>
            </div>
          </div>
          <div className="relative bg-neutral-900/40 rounded-xl p-6 sm:p-8 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="text-5xl sm:text-6xl mb-4 animate-pulse">🔩</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Проверенная надежность</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Используем качественные комплектующие, тщательно проверенные временем и испытаниями.
            </p>
            <div className={`mt-4 text-gray-400 text-sm transition-all duration-300 ${isMobile || isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p>Каждый элемент тестируется не менее 1000 часов в экстремальных режимах — так мы убеждаемся в его надёжности.</p>
            </div>
          </div>
          <div className="relative bg-neutral-900/40 rounded-xl p-6 sm:p-8 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="text-5xl sm:text-6xl mb-4 animate-pulse">🛠️</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3">Поддержка и сервис</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Предоставляем полный спектр услуг: от консультации до оригинальных запчастей.
            </p>
            <div className={`mt-4 text-gray-400 text-sm transition-all duration-300 ${isMobile || isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p>Доступ к поддержке 24/7 и возможность быстро заменить важные детали помогут сохранить оборудование в рабочем состоянии дольше.</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 sm:mt-16">
          <button
            onClick={scrollToCatalog}
            className="sm:px-8 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-500 border-b-4 border-green-700 px-6 py-3 rounded-3xl font-semibold hover:bg-green-500 transition-colors"
          >
            Посмотреть каталог и сделать заказ
          </button>
        </div>
      </div>
    </section>
  );
}