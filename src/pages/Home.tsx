import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Catalog from '../components/Catalog';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

export default function Home() {
	return (
		<>
			<Header />
			<Hero />
			<Features />
			<Catalog />
			<section className="bg-neutral-800 text-gray-200">
				<div className="container mx-auto section">
					<h2 className="text-4xl text-center mb-12">Свяжитесь с нами</h2>
					<div className="max-w-3xl mx-auto">
						<ContactForm />
					</div>
				</div>
			</section>
			<Footer />
		</>
	);
}