import NewsList from '../components/NewsList';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function News() {
	return (
		<>
			<Header />
			<section className="py-12 bg-gray-100">
				<div className="container mx-auto">
					<h1 className="text-4xl font-bold mb-6 text-center">Новости компании</h1>
					<p className="text-center max-w-2xl mx-auto">Следите за нашими новостями и акциями</p>
				</div>
			</section>
			<NewsList />
			<Footer />
		</>
	);
}