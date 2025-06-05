// src/components/Breadcrumbs.tsx
import { useNavigate } from 'react-router-dom';

export default function Breadcrumbs({ currentPage }: { currentPage: string }) {
  return (
    <div className="bg-gray-200 py-3 px-6">
      <div className="container mx-auto text-sm text-gray-600">
        <a href="/" className="hover:text-orange-500">Главная</a> /{' '}
        <span className="text-gray-800 font-medium">{currentPage}</span>
      </div>
    </div>
  );
}