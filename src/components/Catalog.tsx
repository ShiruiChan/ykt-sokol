import ProductCard from './ProductCard';
import Reveal from './Reveal';
import { products } from '../data/products';

export default function Catalog() {
	return (
		<section id="catalog" className="section scroll-mt-24 bg-ink-900">
			<div className="shell">
				<Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							Линейка {new Date().getFullYear()}
						</p>
						<h2 className="mt-5 text-title text-fog-50">Модели</h2>
					</div>
					<p className="max-w-sm text-fog-400 md:text-right">
						Шесть машин — от компактного двухместного до трёхместного пикапа с блокировкой.
						Любую комплектуем под задачу.
					</p>
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
