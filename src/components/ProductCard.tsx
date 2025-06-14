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
          className="w-full h-64 object-cover cursor-pointer"
					onClick={() => setIsModalOpen(true)}
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-100">{product.name}</h3>
					<div className='flex justify-between'>
						<p className="text-grayText text-sm w-1/2 my-1">{product.description}</p>
          	<p className="font-bold text-orange-500 text-lg">{product.price.toLocaleString()} ₽</p>
					</div>
          
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">{product.name}</h2>
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