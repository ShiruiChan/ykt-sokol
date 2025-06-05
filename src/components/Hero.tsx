export default function Hero() {
  return (
    <section className="relative bg-dark text-white py-24 sm:py-32 text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Мощь. Проходимость. Твой квадроцикл.
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-6">
          Производим мощные внедорожные квадрациклы размером 3x2 метра и выше
        </p>
        <a href="#catalog" className="btn-primary">Посмотреть каталог</a>
      </div>
    </section>
  );
}