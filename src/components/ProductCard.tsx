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
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-md overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-200">{product.name}</h3>
          <p className="text-gray-400 my-2">{product.description}</p>
          <p className="font-bold text-gray-300">{product.price.toLocaleString()} ₽</p>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">{product.name}</h2>
          <ImageGallery images={product.images} />
          <div className="mt-4">
            <Link
              to={`/product/${product.id}`}
              className="bg-gray-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors inline-block"
              onClick={() => setIsModalOpen(false)}
            >
              Подробнее
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}