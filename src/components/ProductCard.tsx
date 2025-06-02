import { Product } from "../types";

interface Props {
	product: Product;
}

export default function ProductCard({ product }: Props) {
	return (
		<div className="bg-white shadow-lg rounded overflow-hidden transform hover:scale-105 transition duration-300">
			<img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
			<div className="p-6">
				<h3 className="text-xl font-bold mb-2">{product.name}</h3>
				<p className="text-gray-600 mb-4">{product.description}</p>
				<p className="font-bold text-primary text-xl mb-4">{product.price}</p>
				<a href={`/product`} className="btn-primary">Подробнее</a>
			</div>
		</div>
	);
}