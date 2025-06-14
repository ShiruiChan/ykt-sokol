export default function Hero() {
  return (
    <section className="bg-gray-900 text-gray-200 py-24 sm:py-32 text-center relative overflow-hidden">
      <div className="container mx-auto px-4 z-10 relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
					Профессиональные квадрациклы для охоты, бизнеса и приключений
				</h1>
				<p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
					Созданы для работы в сложных условиях и бездорожья. Подходят для перевозки грузов, охоты, патрулирования и путешествий.
				</p>
        <a href="#catalog" className="bg-gray-500 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-400 transition-colors inline-block">Посмотреть каталог</a>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-transparent pointer-events-none"></div>
    </section>
  );
}