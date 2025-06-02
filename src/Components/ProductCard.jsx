const ProductCard = ({ name, description, price, image }) => {
	return (
		<div className="bg-white shadow-md rounded p-4 text-center">
			<img src={image} alt={name} className="w-full h-48 object-cover mb-4 rounded" />
			<h3 className="text-xl font-semibold">{name}</h3>
			<p className="text-gray-600 my-2">{description}</p>
			<p className="font-bold text-orange-600">{price}</p>
			<a href={`/product`} className="block mt-4 text-white bg-orange-500 px-4 py-2 rounded hover:bg-orange-600">
				Подробнее
			</a>
		</div>
	);
};

export default ProductCard;