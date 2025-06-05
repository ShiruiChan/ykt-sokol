// src/pages/ProductPage.tsx
import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = products.find(p => p.id === Number(id));

  if (!product) {
    return <div className="section text-center">Товар не найден</div>;
  }

  return (
    <div className="bg-light text-dark section">
			<Header />
      <div className="container mx-auto px-4">
        <Breadcrumbs currentPage={product.name} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <img src={product.image} alt={product.name} className="w-full rounded" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
            <p className="mb-4">{product.description}</p>

            <ul className="list-disc ml-5 mb-4">
              <li>Размер: {product.specs.size}</li>
              <li>Высота: {product.specs.height}</li>
              <li>Двигатель: {product.specs.engine || 'Не указан'}</li>
            </ul>

            <p className="font-bold text-xl">Цена: {product.price}</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">Аксессуары:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {product.accessories.length > 0 ? (
            product.accessories.map((acc, i) => (
              <div key={i} className="card">
                <img src={acc.image} alt={acc.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h4 className="font-semibold">{acc.name}</h4>
                  <p className="text-sm">{acc.description}</p>
                  <p className="mt-2 font-medium">{acc.price}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Нет доступных аксессуаров для этой модели.</p>
          )}
        </div>
      </div>
    </div>
  );
}