// src/components/ProductCard.tsx
import { useState } from 'react';
import Modal from './Modal';
import type { Product } from '../types';
import { Link } from 'react-router-dom';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="card">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        />
        <div className="p-4">
          <h3 className="text-xl font-semibold">{product.name}</h3>
          <p className="text-grayText my-2">{product.description}</p>
          <p className="font-bold text-primary">{product.price}</p>
        </div>
      </div>

      {/* Модальное окно с изображением */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
          <img src={product.image} alt={product.name} className="w-full h-auto mb-4 rounded" />
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="mb-4">{product.description}</p>
          <Link
            to={`/product/${product.id}`}
            className="btn-primary inline-block"
            onClick={() => setIsModalOpen(false)}
          >
            Подробнее
          </Link>
        </div>
      </Modal>
    </>
  );
}