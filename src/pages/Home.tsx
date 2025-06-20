import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Catalog from '../components/Catalog';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';
import DynamicYandexMap from '../components/mapYandex';

export default function Home() {
	return (
		<>
			<Header />
			<Hero />
			<Features />
			<Catalog />
			<section className="bg-neutral-800 text-gray-200">
				<div className="container mx-auto section">
					<div className="max-w-4xl mx-auto">
						<DynamicYandexMap />
					</div>
				</div>
			</section>
			<Footer />
		</>
	);
}