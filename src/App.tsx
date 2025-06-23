// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScrollToTop from './scripts/ScrollToTop';
import RouteProgress from './components/scripts/RouteProgress';
import SeoTitle from './components/SeoTitle';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-загрузка страниц
const Home = React.lazy(() => import('./pages/Home'));
const News = React.lazy(() => import('./pages/News'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Анимация для страниц
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

const AnimatedRoute = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <>
      {/* Индикатор прогресса */}
      <RouteProgress />

      {/* Скролл вверх при переходе */}
      <ScrollToTop />

      {/* Маршруты с анимацией и динамическими заголовками */}
      <Routes>
        <Route
          path="/"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AnimatedRoute>
                <SeoTitle title="Главная — Sokol" />
                <Home />
              </AnimatedRoute>
            </React.Suspense>
          }
        />

        <Route
          path="/news"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AnimatedRoute>
                <SeoTitle title="Новости — Sokol" />
                <News />
              </AnimatedRoute>
            </React.Suspense>
          }
        />

        <Route
          path="/product/:id"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AnimatedRoute>
                <SeoTitle title="Продукт — Sokol" />
                <ProductPage />
              </AnimatedRoute>
            </React.Suspense>
          }
        />

        <Route
          path="/gallery"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AnimatedRoute>
                <SeoTitle title="Галерея — Sokol" />
                <Gallery />
              </AnimatedRoute>
            </React.Suspense>
          }
        />

        <Route
          path="*"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <AnimatedRoute>
                <SeoTitle title="Страница не найдена — Sokol" />
                <NotFound />
              </AnimatedRoute>
            </React.Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;