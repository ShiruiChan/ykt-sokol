import { lazy, Suspense } from 'react';
import Seo from '../components/Seo';
import { homeMeta } from '../seo';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SectionSkeleton from '../components/SectionSkeleton';
import MobileCta from '../components/MobileCta';

// Ниже первого экрана: подгружаем по мере необходимости.
const Features = lazy(() => import('../components/Features'));
const Catalog = lazy(() => import('../components/Catalog'));
const BuySteps = lazy(() => import('../components/BuySteps'));
const Faq = lazy(() => import('../components/Faq'));
const ContactsMap = lazy(() => import('../components/mapYandex'));
const Footer = lazy(() => import('../components/Footer'));

export default function Home() {
	return (
		<>
			<Seo meta={homeMeta} />

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
					<BuySteps />
				</Suspense>

				<Suspense fallback={<SectionSkeleton />}>
					<Faq />
				</Suspense>

				<Suspense fallback={<SectionSkeleton />}>
					<ContactsMap />
				</Suspense>
			</main>

			<Suspense fallback={null}>
				<Footer />
			</Suspense>

			<MobileCta />
		</>
	);
}
