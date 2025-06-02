import ProductCard from './ProductCard';

const products = [
	{
		name: "X-100",
		description: "Высокая проходимость и надежность",
		price: "от 450 000 ₽",
		image: "/images/quad-1.jpg"
	},
	{
		name: "X-200",
		description: "Для охотников и путешествий",
		price: "от 520 000 ₽",
		image: "/images/quad-2.jpg"
	},
	{
		name: "X-300",
		description: "Для бизнеса и перевозки грузов",
		price: "от 600 000 ₽",
		image: "/images/quad-3.jpg"
	}
];

const Catalog = () => {
	return (
		<section id="catalog" className="py-12 bg-gray-100">
			<div className="container mx-auto">
				<h2 className="text-3xl font-bold mb-8 text-center">Наши модели</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{products.map((product, index) => (
						<ProductCard key={index} {...product} />
					))}
				</div>
			</div>
		</section>
	);
};

export default Catalog;	