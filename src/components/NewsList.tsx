// src/components/NewsList.tsx
import { useEffect, useState } from 'react';
import type { NewsItem } from '../types';

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch('https://your-backend.up.railway.app/news') 
      .then(res => res.json())
      .then(data => setNews(data));
  }, []);

  return (
    <section className="bg-light text-dark section">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Новости компании</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <div key={i} className="card">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-grayText mt-2">{item.date}</p>
                <p className="mt-2">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}