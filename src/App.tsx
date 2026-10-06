import React, { type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ScrollToTop, { scrollToTop } from './scripts/ScrollToTop';
import RouteProgress from './components/scripts/RouteProgress';
import LoadingSpinner from './components/LoadingSpinner';
import RequestModal from './components/RequestModal';
import { useAfterLoad } from './motion/useAfterLoad';
import { canHoverFx } from './motion/media';

// Плавный скролл: отдельный чанк, только десктоп с мышью и без reduced-motion
const SmoothScroll = React.lazy(() => import('./motion/SmoothScroll'));

const Home = React.lazy(() => import('./pages/Home'));
const News = React.lazy(() => import('./pages/News'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Documents = React.lazy(() => import('./pages/Cert'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

/**
 * Смена страниц: crossfade, только opacity. Без сдвига: transform на обёртке
 * сломал бы position: fixed у шапки и пины ScrollTrigger внутри страницы.
 */
function PageShell({ children }: { children: ReactNode }) {
	const reduce = useReducedMotion();

	return (
		<React.Suspense fallback={<LoadingSpinner />}>
			<motion.div
				className="flex min-h-dvh flex-col"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { duration: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] } }}
				exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.22, ease: [0.32, 0.72, 0, 1] } }}
			>
				{children}
			</motion.div>
		</React.Suspense>
	);
}

export default function App() {
	const location = useLocation();
	const smoothReady = useAfterLoad();

	return (
		<>
			<RouteProgress />
			<ScrollToTop />
			{/* Условие проверяем до lazy-импорта: на телефоне чанк Lenis даже не скачивается */}
			{smoothReady && canHoverFx() && (
				<React.Suspense fallback={null}>
					<SmoothScroll />
				</React.Suspense>
			)}

			{/* mode="wait": старая страница гаснет и размонтируется (её ScrollTrigger'ы
			    и pin-spacer'ы откатываются), только потом входит новая.
			    initial={false}: первая страница видна сразу, это бережёт LCP. */}
			<AnimatePresence mode="wait" initial={false} onExitComplete={scrollToTop}>
				<Routes location={location} key={location.pathname}>
					<Route
						path="/"
						element={
							<PageShell>
								<Home />
							</PageShell>
						}
					/>
					<Route
						path="/news"
						element={
							<PageShell>
								<News />
							</PageShell>
						}
					/>
					<Route
						path="/product/:id"
						element={
							<PageShell>
								<ProductPage />
							</PageShell>
						}
					/>
					<Route
						path="/gallery"
						element={
							<PageShell>
								<Gallery />
							</PageShell>
						}
					/>
					<Route
						path="/cert"
						element={
							<PageShell>
								<Documents />
							</PageShell>
						}
					/>
					<Route
						path="*"
						element={
							<PageShell>
								<NotFound />
							</PageShell>
						}
					/>
				</Routes>
			</AnimatePresence>

			{/* Модалка заявки живёт над маршрутами: открывается из любой точки сайта */}
			<RequestModal />

			{/* Плёночное зерно поверх интерфейса */}
			<div className="grain" aria-hidden />
		</>
	);
}
