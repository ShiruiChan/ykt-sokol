import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import ContactForm from '../components/ContactForm';

export default function ProductPage() {
	const { id } = useParams<{ id: string }>();
	const product = products.find(p => p.id === Number(id));

	if (!product) return <div>Продукт не найден</div>;

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex flex-col md:flex-row gap-8">
				<div className="md:w-1/2">
					<img src={product.image} alt={product.name} className="w-full rounded" />
				</div>
				<div className="md:w-1/2">
					<h2 className="text-3xl font-bold mb-4">{product.name}</h2>
					<p className="mb-4">{product.description}</p>
					<ul className="list-disc ml-5 mb-4">
						<li>Двигатель: {product.specs.engine}</li>
						<li>Вес: {product.specs.weight}</li>
						<li>Грузоподъемность: {product.specs.capacity}</li>
					</ul>
					<p className="text-xl font-bold text-orange-600">Цена: {product.price}</p>
				</div>
			</div>

			<h3 className="text-2xl font-bold mt-12 mb-6">Дополнительные опции</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
				{product.accessories.map((acc, i) => (
					<div key={i} className="border p-4 rounded text-center">
						<img src={acc.image} alt={acc.name} className="w-full h-32 object-cover mb-2" />
						<h4 className="font-semibold">{acc.name}</h4>
						<p>Цена: {acc.price}</p>
					</div>
				))}
			</div>

			<ContactForm />
		</div>
	);
}