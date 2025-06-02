import { Product } from '../types';

interface Props {
	product: Product;
}

const ProductCard = ({ product }: Props) => {
	return (
		<div className="bg-white shadow-md rounded p-4 text-center">
			<img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4 rounded" />
			<h3 className="text-xl font-semibold">{product.name}</h3>
			<p className="text-gray-600 my-2">{product.description}</p>
			<p className="font-bold text-orange-600">{product.price}</p>
			<a href={`/product/${product.id}`} className="block mt-4 text-white bg-orange-500 px-4 py-2 rounded hover:bg-orange-600">
				Подробнее
			</a>
		</div>
	);
};

export default ProductCard;