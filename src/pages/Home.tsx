import Hero from '../components/Hero';
import Features from '../components/Features';
import Catalog from '../components/Catalog';
import ContactsMap from '../components/mapYandex';

/**
 * Секции главной грузятся одним чанком: вместе они весят ~20 КБ, а
 * дробление давало мигание скелетонов и пустой HTML для поисковиков.
 */
export default function Home() {
	return (
		<main id="main">
			<Hero />
			<Features />
			<Catalog />
			<ContactsMap />
		</main>
	);
}
