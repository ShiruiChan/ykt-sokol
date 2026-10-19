import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { LazyMotion, m, useReducedMotion } from 'framer-motion';
import ScrollToTop from './scripts/ScrollToTop';
import Seo from './seo/Seo';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
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
			<Footer />
		</>
	);
}

/** Старые адреса /product/:id ведут на новые /models/:slug */
function LegacyProductRedirect() {
	const { id } = useParams();
	const product = products.find((p) => p.id === Number(id));
	return <Navigate to={product ? productPath(product) : '/'} replace />;
}

export default function App() {
	return (
		// strict: случайный motion.* вместо m.* сразу упадёт, а не притащит весь пакет обратно
		<LazyMotion features={loadMotionFeatures} strict>
			<Seo />
			<Metrika />
			<ScrollToTop />

			<Routes>
				<Route element={<Layout />}>
					<Route index element={<Home />} />
					<Route path="models/:slug" element={<ProductPage />} />
					<Route path="product/:id" element={<LegacyProductRedirect />} />
					<Route path="compare" element={<Compare />} />
					<Route path="service" element={<Service />} />
					<Route path="news" element={<News />} />
					<Route path="gallery" element={<Gallery />} />
					<Route path="cert" element={<Documents />} />
					<Route path="privacy" element={<Privacy />} />
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
