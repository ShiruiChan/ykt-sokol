// src/components/ProductCard.tsx
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
          src={product.images[0]} // Первая картинка для карточки
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

      {/* Модальное окно с галереей */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
          <ImageGallery images={product.images} />
          <div className="mt-4">
            <Link
              to={`/product/${product.id}`}
              className="btn-primary inline-block"
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