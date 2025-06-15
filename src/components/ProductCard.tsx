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
      <div className="card">
        <img
          src={product.images[0]}
          alt={`${product.name} - квадроцикл`}
          className="w-full h-72 object-cover cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />
        <Link to={`/product/${product.id}`}>
          <div className="p-4">
						<div className="flex justify-between">
							<h3 className="text-xl font-semibold text-orange-400">{product.name}</h3>
							<p className="font-bold text-teal-400 text-lg">{product.price.toLocaleString()} ₽</p>
						</div>
            <div className="flex justify-between">
              <p className="text-grayText text-sm w-1/2 my-1">{product.description}</p>
							<button className='text-gray-400 underline text-sm'>Подробнее</button>
            </div>
          </div>
        </Link>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-200">{product.name}</h2>
          <ImageGallery images={product.images} />
          <div className="mt-4">
            <Link
              to={`/product/${product.id}`}
              className="btn-primary"
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