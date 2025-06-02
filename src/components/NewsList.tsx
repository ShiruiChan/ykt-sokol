import { newsItems } from '../data/news';
import { Link } from 'react-router-dom';

export default function NewsList() {
	const latestNews = newsItems.slice(0, 3); // Только последние 3 новости

	return (
		<section className="py-12 bg-gray-100">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold mb-8 text-center">Новости компании</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{latestNews.map(item => (
						<div key={item.id} className="bg-white shadow-md rounded overflow-hidden">
							<img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
							<div className="p-4">
								<h3 className="text-xl font-semibold">{item.title}</h3>
								<p className="text-gray-500">{item.date}</p>
								<a href="#" className="text-orange-500 hover:underline mt-2 inline-block">Читать далее →</a>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}