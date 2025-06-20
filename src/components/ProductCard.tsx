import { useState } from 'react';
import Modal from './Modal';
import ImageGallery from './ImageGallery';
import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-zinc-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md w-full mx-auto">
        {/* Изображение */}
        <img
          src={product.images[0]}
          alt={`${product.name} - квадроцикл`}
          className="w-full h-64 object-cover cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />

        {/* Ссылка на страницу товара */}
        <Link to={`/product/${product.id}`} className="block p-4 z-1 pb-0">
          {/* Заголовок и цена */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
            <span className="text-green-600 font-bold text-lg">{product.price.toLocaleString()} ₽</span>
          </div>

          {/* Краткое описание */}
          <p className="text-gray-500 text-sm mb-3">{product.deskSmall}</p>

          {/* Ключевые характеристики */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-500 mb-4">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700">Двигатель:</span>
              <span className="text-gray-800">{product.specs.engine}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700">Размер:</span>
              <span className="text-gray-800">{product.specs.size}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700">Скорость:</span>
              <span className="text-gray-800">{product.specs.maxSpeed}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700">Клиренс:</span>
              <span className="text-gray-800">{product.specs.clearance}</span>
            </div>
          </div>
				</Link>
				<div className='block p-4 pt-0 z-1'>
					{/* Действия */}
          <div className="flex gap-2 mt-4 z-10">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition"
            >
              Галерея
            </button>
						<Link
              to={`/product/${product.id}`}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md transition text-center"
            >
              Подробнее
            </Link>
          </div>
				</div>
      </div>

      {/* Модалка с полной информацией */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center bg-neutral-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-zinc-300">{product.name}</h2>
          <ImageGallery images={product.images} />
          <div className="mt-4">
            <Link
              to={`/product/${product.id}`}
              className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition"
              onClick={() => setIsModalOpen(false)}
            >
              Перейти к товару
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}