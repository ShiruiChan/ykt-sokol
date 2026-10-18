import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import { ArrowUpRight } from './Icons';
import { plural, products } from '../data/products';

// Число моделей берём из данных — подпись не устареет при добавлении машины
const COUNT = products.length;

export default function Catalog() {
	return (
		<section id="catalog" className="section scroll-mt-24 bg-ink-900">
			<div className="shell">
				<Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							Сделано в Якутске
						</p>
						<h2 className="mt-5 text-title text-fog-50">Модели</h2>
					</div>
					<div className="max-w-sm md:text-right">
						<p className="text-fog-400">
							{COUNT} {plural(COUNT, ['машина', 'машины', 'машин'])} — от компактного
							двухместного до трёхместного пикапа с блокировкой. Любую комплектуем под задачу.
						</p>
						<Link to="/compare" className="link-quiet mt-4 text-sm">
							Сравнить модели
							<ArrowUpRight className="h-4 w-4" />
						</Link>
					</div>
				</Reveal>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
					{products.map((product, i) => (
						<Reveal key={product.id} delay={(i % 3) * 0.08} className="h-full">
							<ProductCard product={product} />
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
