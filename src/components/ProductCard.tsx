// src/components/ProductCard.tsx
import { Link } from 'react-router-dom';
import type { Product } from '../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Link to={`/product/${product.id}`} className="card">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{product.name}</h3>
        <p className="text-grayText my-2">{product.description}</p>
        <p className="font-bold text-primary">{product.price}</p>
      </div>
    </Link>
  );
}