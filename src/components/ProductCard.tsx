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
							<h3 className="text-xl font-semibold text-black">{product.name}</h3>
							<p className="font-bold text-lg text-black">{product.price.toLocaleString()} ₽</p>
						</div>
            <div className="flex justify-between">
              <p className="text-black text-sm w-1/2 my-1">{product.deskSmall}</p>
							<button className='text-black underline text-sm'>Подробнее</button>
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