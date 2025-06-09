// src/components/NewsList.tsx
import { useEffect, useState } from 'react';
import { newsItems } from '../data/news';

export default function NewsList() {

  return (
		<section className="py-12 bg-gray-100">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold mb-8 text-center">Новости компании</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{newsItems.map(item => (
						<div className="bg-gray-200 shadow-md rounded-xl overflow-hidden">
							<img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
							<div className="p-4">
								<h3 className="text-xl font-semibold">{item.title}</h3>
								<p className="text-gray-500">{item.date}</p>
								<p className="text-m text-orange-400 font-semibold">{item.content}</p>
								<a className="text-orange-500 hover:underline mt-2 inline-block">Читать далее →</a>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}