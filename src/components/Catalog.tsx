import ProductCard from './ProductCard';
import { products } from '../data/products';

export default function Catalog() {
	return (
		<section id="catalog" className="section bg-gray-900 text-gray-200">
			<div className="container mx-auto px-4">
				<h2 className="text-4xl text-center mb-16">Наши модели</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{products.map(product => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			</div>
		</section>
	);
}