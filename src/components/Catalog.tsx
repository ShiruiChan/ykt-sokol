import { lazy, Suspense, useRef } from 'react';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import { products } from '../data/products';
import SplitText from '../motion/SplitText';
import { useAfterLoad } from '../motion/useAfterLoad';

const CatalogScene = lazy(() => import('../motion/scenes/CatalogScene'));

export default function Catalog() {
	const ref = useRef<HTMLElement>(null);
	const sceneReady = useAfterLoad();

	return (
		<section ref={ref} id="catalog" className="section scroll-mt-24 bg-ink-900">
			{sceneReady && (
				<Suspense fallback={null}>
					<CatalogScene scope={ref} />
				</Suspense>
			)}

			<div className="shell">
				<Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							Линейка {new Date().getFullYear()}
						</p>
						<SplitText as="h2" className="mt-5 text-title text-fog-50" lines={[{ text: 'Модели' }]} />
					</div>
					<p className="max-w-sm text-fog-400 md:text-right">
						Шесть машин: от компактного двухместного до трёхместного пикапа с блокировкой.
						Любую комплектуем под задачу.
					</p>
				</Reveal>

				<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
					{products.map((product) => (
						<div key={product.id} data-cat-card className="h-full">
							<ProductCard product={product} />
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
