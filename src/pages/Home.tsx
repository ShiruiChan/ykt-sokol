import NewsList from '../components/NewsList';
import ContactForm from '../components/ContactForm';
import Hero from '../components/Hero';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Catalog from '../components/Catalog';

export default function Home() {
	return (
		<>
			<Header /> {/* Теперь шапка отображается на главной */}
			<Hero />
			<Catalog />
			<NewsList />
			<ContactForm />
			<Footer />
		</>
	);
}