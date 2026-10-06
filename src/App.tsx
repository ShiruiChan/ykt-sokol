import React, { type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import ScrollToTop from './scripts/ScrollToTop';
import RouteProgress from './components/scripts/RouteProgress';
import LoadingSpinner from './components/LoadingSpinner';
import RequestModal from './components/RequestModal';

const Home = React.lazy(() => import('./pages/Home'));
const News = React.lazy(() => import('./pages/News'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Documents = React.lazy(() => import('./pages/Cert'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

/** Мягкая смена страниц: только opacity + сдвиг, без «прыжка» макета */
function PageShell({ children }: { children: ReactNode }) {
	const reduce = useReducedMotion();

	return (
		<React.Suspense fallback={<LoadingSpinner />}>
			<motion.div
				className="flex min-h-dvh flex-col"
				initial={reduce ? false : { opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
			>
				{children}
			</motion.div>
		</React.Suspense>
	);
}

export default function App() {
	const location = useLocation();

	return (
		<>
			<RouteProgress />
			<ScrollToTop />

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

			{/* Модалка заявки живёт над маршрутами: открывается из любой точки сайта */}
			<RequestModal />

			{/* Плёночное зерно поверх интерфейса */}
			<div className="grain" aria-hidden />
		</>
	);
}
