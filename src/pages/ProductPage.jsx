import Header from '../Components/Header';
import Footer from '../Components/Footer';
import Breadcrumbs from '../Components/Breadcrumbs';

const ProductPage = () => {
	return (
		<>
			<Header />
			<Breadcrumbs currentPage="X-100" />
			<section className="py-12">
				<div className="container mx-auto">
					<div className="flex flex-col md:flex-row gap-8">
						<div className="md:w-1/2">
							<img src="/images/quad-1-detail.jpg" alt="X-100" className="w-full rounded" />
						</div>
						<div className="md:w-1/2">
							<h2 className="text-3xl font-bold mb-4">Модель X-100</h2>
							<p className="mb-4">Мощный внедорожник с усиленной рамой и колесами повышенной проходимости. Идеален для охоты и экспедиций.</p>
							<ul className="list-disc ml-5 mb-4">
								<li>Двигатель: 1000 см³</li>
								<li>Вес: 450 кг</li>
								<li>Грузоподъемность: 200 кг</li>
							</ul>
							<p className="text-xl font-bold text-orange-600">Цена: от 450 000 ₽</p>
						</div>
					</div>

					<h3 className="text-2xl font-bold mt-12 mb-6">Дополнительные опции</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						<div className="border p-4 rounded text-center">
							<img src="/images/addition-1.jpg" alt="Лебёдка" className="w-full h-32 object-cover mb-2" />
							<h4 className="font-semibold">Лебёдка</h4>
							<p>Цена: 30 000 ₽</p>
						</div>
						<div className="border p-4 rounded text-center">
							<img src="/images/addition-2.jpg" alt="Подогрев ручек" className="w-full h-32 object-cover mb-2" />
							<h4 className="font-semibold">Подогрев ручек</h4>
							<p>Цена: 15 000 ₽</p>
						</div>
						<div className="border p-4 rounded text-center">
							<img src="/images/addition-3.jpg" alt="Фаркоп" className="w-full h-32 object-cover mb-2" />
							<h4 className="font-semibold">Фаркоп</h4>
							<p>Цена: 20 000 ₽</p>
						</div>
					</div>
				</div>
			</section>
			<Footer />
		</>
	);
};

export default ProductPage;