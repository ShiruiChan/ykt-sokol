import { useEffect, useState } from 'react';
import { newsItems } from '../data/news';

export default function NewsList() {
  return (
		<section className="py-12 bg-gray-900">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold mb-8 text-center text-gray-200">Новости компании</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{newsItems.map(item => (
						<div className="bg-gray-800 shadow-md rounded-xl overflow-hidden border border-gray-600">
							<img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
							<div className="p-4">
								<h3 className="text-xl font-semibold text-gray-200">{item.title}</h3>
								<p className="text-gray-500">{item.date}</p>
								<p className="text-m text-gray-300">{item.content}</p>
								<a className="text-gray-400 hover:text-gray-200 mt-2 inline-block transition">Читать далее →</a>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}