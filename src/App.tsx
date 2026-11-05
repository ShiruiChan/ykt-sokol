import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { LazyMotion, m, useReducedMotion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import ScrollToTop from './scripts/ScrollToTop';
import Seo from './seo/Seo';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import RequestModal from './components/RequestModal';
import Metrika from './components/Metrika';
import ContactDock from './components/ContactDock';
import { products, productPath } from './data/products';

const Home = React.lazy(() => import('./pages/Home'));
const News = React.lazy(() => import('./pages/News'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const Documents = React.lazy(() => import('./pages/Cert'));
const Compare = React.lazy(() => import('./pages/Compare'));
const Service = React.lazy(() => import('./pages/Service'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Kp = React.lazy(() => import('./pages/Kp'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const loadMotionFeatures = () => import('./motion-features').then((mod) => mod.default);

/**
 * Общая оболочка всех страниц. Шапка и подвал живут здесь и не
 * пересоздаются при переходах — поэтому подсветка пункта меню плавно
 * переезжает, а шапка не мигает. Анимируется только содержимое.
 */
function Layout() {
	const { pathname } = useLocation();
	const reduce = useReducedMotion();

	return (
		<>
			<Header />
			{/* key: при переходе на другую страницу ошибка прошлой не «залипает» */}
			<ErrorBoundary key={pathname}>
			<React.Suspense fallback={<LoadingSpinner />}>
				<m.div
					key={pathname}
					className="flex flex-1 flex-col"
					initial={reduce ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
				>
					<Outlet />
				</m.div>
			</React.Suspense>
			</ErrorBoundary>
			<Footer />
		</>
	);
}

/**
 * Снятые с продажи модели → ближайшая актуальная. Дублирует redirects
 * в vercel.json: там — 301 для поисковиков, здесь — переходы внутри SPA.
 */
const RETIRED_IDS: Record<number, string> = { 3: 'sokol-plus-timken' };
const RETIRED_SLUGS: Record<string, string> = { 'sokol-plus-jimny': 'sokol-plus-timken' };

/** Старые адреса /product/:id ведут на новые /models/:slug */
function LegacyProductRedirect() {
	const { id } = useParams();
	const product = products.find((p) => p.id === Number(id));
	const retired = RETIRED_IDS[Number(id)];
	const to = product ? productPath(product) : retired ? productPath({ slug: retired }) : '/';
	return <Navigate to={to} replace />;
}

function ModelRoute() {
	const { slug = '' } = useParams();
	const target = RETIRED_SLUGS[slug];
	return target ? <Navigate to={productPath({ slug: target })} replace /> : <ProductPage />;
}

export default function App() {
	return (
		// strict: случайный motion.* вместо m.* сразу упадёт, а не притащит весь пакет обратно
		<LazyMotion features={loadMotionFeatures} strict>
			<Seo />
			<Metrika />
			{/* Vercel Web Analytics: переходы между страницами SPA отслеживает сама */}
			<Analytics />
			<ScrollToTop />

			<Routes>
				<Route element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="models/:slug" element={<ModelRoute />} />
					<Route path="product/:id" element={<LegacyProductRedirect />} />
					<Route path="compare" element={<Compare />} />
					<Route path="service" element={<Service />} />
					<Route path="news" element={<News />} />
					<Route path="gallery" element={<Gallery />} />
					<Route path="cert" element={<Documents />} />
					<Route path="privacy" element={<Privacy />} />
					{/* Коммерческое предложение: noindex, в sitemap не попадает */}
					<Route path="kp" element={<Kp />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>

			{/* Модалка заявки живёт над маршрутами — открывается из любой точки сайта */}
			<RequestModal />

			{/* Быстрая связь на мобильных: WhatsApp, Telegram, звонок */}
			<ContactDock />

			{/* Плёночное зерно поверх интерфейса */}
			<div className="grain" aria-hidden />
		</LazyMotion>
	);
}
