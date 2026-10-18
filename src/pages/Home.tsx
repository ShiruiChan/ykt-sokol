import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Catalog from '../components/Catalog';
import ContactsMap from '../components/mapYandex';
import Faq from '../components/Faq';
import Reveal from '../components/Reveal';
import { ArrowUpRight } from '../components/Icons';
import { FAQ } from '../data/faq';

// Короткая выборка: на главной — только то, что спрашивают до звонка
const HOME_FAQ = FAQ.filter((f) => f.home).slice(0, 5);

function HomeFaq() {
	return (
		<section aria-labelledby="home-faq" className="section border-b border-white/6 bg-ink-950">
			<div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
				<Reveal className="lg:col-span-4">
					<p className="eyebrow">
						<span className="h-px w-8 bg-accent-400/70" />
						вопросы
					</p>
					<h2 id="home-faq" className="mt-5 text-title text-fog-50">
						Коротко о покупке
					</h2>
					<p className="mt-5 max-w-sm text-fog-400">
						Доставка, документы, ремонт и оплата — подробно на отдельной странице.
					</p>
					<Link to="/service" className="link-quiet mt-6">
						Все вопросы
						<ArrowUpRight className="h-4 w-4" />
					</Link>
				</Reveal>
				<Reveal delay={0.08} className="lg:col-span-8">
					<Faq items={HOME_FAQ} />
				</Reveal>
			</div>
		</section>
	);
}

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
			<HomeFaq />
			<ContactsMap />
		</main>
	);
}
