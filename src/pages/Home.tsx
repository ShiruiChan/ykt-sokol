import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SectionSkeleton from '../components/SectionSkeleton';

// Ниже первого экрана — подгружаем по мере необходимости.
const Features = lazy(() => import('../components/Features'));
const Catalog = lazy(() => import('../components/Catalog'));
const ContactsMap = lazy(() => import('../components/mapYandex'));
const Footer = lazy(() => import('../components/Footer'));

export default function Home() {
	return (
		<>
			<Helmet>
				<title>СОКОЛ | Снегоболотоходы производства Якутск</title>
				<meta
					name="description"
					content="СОКОЛ — производство снегоболотоходов в Якутске. Надёжная вездеходная техника для охоты, рыбалки, бизнеса и путешествий по бездорожью, снегу и болотам."
				/>
				<link rel="canonical" href="https://ykt-sokol.vercel.app/" />
			</Helmet>

			<Header />

			<main id="main">
				<Hero />

				<Suspense fallback={<SectionSkeleton />}>
					<Features />
				</Suspense>

				<Suspense fallback={<SectionSkeleton />}>
					<Catalog />
				</Suspense>

				<Suspense fallback={<SectionSkeleton />}>
					<ContactsMap />
				</Suspense>
			</main>

			<Suspense fallback={null}>
				<Footer />
			</Suspense>
		</>
	);
}
