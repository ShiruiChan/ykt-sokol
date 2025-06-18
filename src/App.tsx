import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import News from './pages/News';
import ProductPage from './pages/ProductPage';
import NotFound from './pages/NotFound';
import ScrollToTop from './scripts/ScrollToTop';
import SeoTitle from './components/SeoTitle';
import { motion, AnimationType } from 'framer-motion';

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
      {/* Скролл вверх при переходе */}
      <ScrollToTop />

      {/* Маршруты с анимацией и динамическими заголовками */}
      <Routes>
        <Route path="/" element={
          <AnimatedRoute>
            <SeoTitle title="Главная" />
            <Home />
          </AnimatedRoute>
        } />

        <Route path="/news" element={
          <AnimatedRoute>
            <SeoTitle title="Новости" />
            <News />
          </AnimatedRoute>
        } />

        <Route path="/product/:id" element={
          <AnimatedRoute>
            <SeoTitle title="Продукт" />
            <ProductPage />
          </AnimatedRoute>
        } />

        <Route path="*" element={
          <AnimatedRoute>
            <SeoTitle title="Страница не найдена" />
            <NotFound />
          </AnimatedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;