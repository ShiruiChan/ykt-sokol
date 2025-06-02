import ProductCard from './ProductCard';
import { products } from '../data/products';

export default function Catalog() {
	return (
		<section id="catalog" className="section bg-light text-dark">
			<div className="container mx-auto px-4">
				<h2 className="text-4xl text-center mb-16">Наши модели</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
					{products.map(product => (
						<ProductCard key={product.id} product={product} />
					))}
				</div>
			</div>
		</section>
	);
}