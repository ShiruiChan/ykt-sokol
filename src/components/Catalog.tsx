import ProductCard from './ProductCard';
import { products } from '../data/products';

export default function Catalog() {
	return (
		<section id="catalog" className="py-16 bg-white">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold mb-12 text-center">Наши модели</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{products.map(product => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			</div>
		</section>
	);
}