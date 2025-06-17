export default function Hero() {
  return (
    <section className="bg-neutral-800 text-gray-100 py-24 sm:py-32 text-center relative overflow-hidden">
      <div className="container mx-auto px-4 z-10 relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Профессиональные квадроциклы для охоты, бизнеса и приключений
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
          Созданы для работы в сложных условиях и бездорожья. Подходят для перевозки грузов, охоты, патрулирования и путешествий.
        </p>
        <a href="#catalog" className="sm:px-8 sm:py-4 bg-green-600 border-b-4 border-green-700 px-6 py-3 rounded-3xl font-semibold hover:bg-green-500 transition-colors">Посмотреть каталог</a>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>
    </section>
  );
}