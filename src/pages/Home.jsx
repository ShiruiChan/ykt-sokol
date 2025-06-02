import Header from '../Components/Header';
import Hero from '../Components/Hero';
import Catalog from '../Components/Catalog';
import NewsList from '../Components/NewsList';
import Footer from '../Components/Footer';

const Home = () => {
	return (
		<>
			<Header />
			<Hero />
			<Catalog />
			<NewsList />
			<Footer />
		</>
	);
};

export default Home;