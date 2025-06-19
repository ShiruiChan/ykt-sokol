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
          Почему мы лучшие на рынке?
        </h2>
				<p className="text-center text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
					Наши продукты созданы, чтобы превзойти ожидания и оставить конкурентов позади. Убедитесь сами!
				</p>
				<div 
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					<div className="relative bg-neutral-900/40 rounded-xl p-6 sm:p-8 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
						<div className="text-5xl sm:text-6xl mb-4 animate-pulse">🛞</div>
						<h3 className="text-xl sm:text-2xl font-bold mb-3">Непревзойденная проходимость</h3>
						<p className="text-gray-300 text-sm sm:text-base">
							Уникальная усиленная рама и колеса с экстремальной проходимостью справятся с любыми условиями, где другие сдаются.
						</p>
						<div className={`mt-4 text-gray-400 text-sm transition-all duration-300 ${isMobile || isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
							<p>Наша запатентованная технология подвески и сверхпрочные материалы обеспечивают стабильность на любых поверхностях, от грязи до скал.</p>
						</div>
					</div>
					<div className="relative bg-neutral-900/40 rounded-xl p-6 sm:p-8 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
						<div className="text-5xl sm:text-6xl mb-4 animate-pulse">🔩</div>
						<h3 className="text-xl sm:text-2xl font-bold mb-3">Абсолютная надежность</h3>
						<p className="text-gray-300 text-sm sm:text-base">
							Только премиальные комплектующие, протестированные в самых суровых условиях. Забудьте о поломках!
						</p>
						<div className={`mt-4 text-gray-400 text-sm transition-all duration-300 ${isMobile || isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
							<p>Каждая деталь проходит 1000+ часов стресс-тестов, чтобы гарантировать бесперебойную работу даже в экстремальных условиях.</p>
						</div>
					</div>
					<div className="relative bg-neutral-900/40 rounded-xl p-6 sm:p-8 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
						<div className="text-5xl sm:text-6xl mb-4 animate-pulse">🛠️</div>
						<h3 className="text-xl sm:text-2xl font-bold mb-3">Элитный сервис</h3>
						<p className="text-gray-300 text-sm sm:text-base">
							Полный цикл поддержки: гарантия, обслуживание и оригинальные запчасти. Мы всегда на шаг впереди конкурентов.
						</p>
						<div className={`mt-4 text-gray-400 text-sm transition-all duration-300 ${isMobile || isHovered ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
							<p>Мгновенный доступ к поддержке 24/7 и эксклюзивным запчастям, которые продлевают срок службы вашего оборудования.</p>
						</div>
					</div>
				</div>
				<div className="text-center mt-12 sm:mt-16">
					<button
						onClick={scrollToCatalog}
						className="sm:px-8 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-500 border-b-4 border-green-700 px-6 py-3 rounded-3xl font-semibold hover:bg-green-500 transition-colors"
					>
						Закажите сейчас и ощутите разницу!
					</button>
				</div>
			</div>
    </section>
  );
}