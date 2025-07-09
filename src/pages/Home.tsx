import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet";

// ⏬ Динамический импорт тяжёлых секций,
//     чтобы первая отрисовка была быстрее.
const Header = lazy(() => import("../components/Header"));
const Hero = lazy(() => import("../components/Hero"));
const Features = lazy(() => import("../components/Features"));
const Catalog = lazy(() => import("../components/Catalog"));
const DynamicYandexMap = lazy(() => import("../components/mapYandex"));
const Footer = lazy(() => import("../components/Footer"));

// Единый ненавязчивый fallback.
const Fallback = () => (
  <div className="flex items-center justify-center py-16 text-gray-400 animate-pulse">
    Загрузка…
  </div>
);

export default function Home() {
  return (
    <>
      {/* SEO — важнейший ресурс для e‑commerce */}
      <Helmet>
        <title>Yakut‑Sokol — квадроциклы‑амфибии</title>
        <meta
          name="description"
          content="Профессиональные квадроциклы‑амфибии для охоты, бизнеса и экстремальных приключений. Надёжны в болотах, снегу и воде."
        />
        <link rel="canonical" href="https://yakut-sokol.ru/" />
      </Helmet>

      {/* Критически важные элементы отображаются первыми. */}
      <Suspense fallback={<Fallback />}>
        <Header />
      </Suspense>

      <main>
        <Suspense fallback={<Fallback />}>
          <Hero />
        </Suspense>

        <Suspense fallback={<Fallback />}>
          <Features />
        </Suspense>

        <Suspense fallback={<Fallback />}>
          <Catalog />
        </Suspense>

        {/* Карту подгружаем последней — это один из самых тяжёлых бандлов. */}
        <section className="bg-neutral-800 text-gray-200">
          <div className="container mx-auto section max-w-4xl">
            <Suspense fallback={<Fallback />}>
              <DynamicYandexMap />
            </Suspense>
          </div>
        </section>
      </main>

      <Suspense fallback={<Fallback />}>
        <Footer />
      </Suspense>
    </>
  );
}