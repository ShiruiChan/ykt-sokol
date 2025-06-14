import { useNavigate } from 'react-router-dom';

export default function Breadcrumbs({ currentPage }: { currentPage: string }) {
  return (
    <div className="bg-gray-800 py-3 px-6">
      <div className="container mx-auto text-sm text-gray-400">
        <a href="/" className="hover:text-gray-300">Главная</a> /{' '}
        <span className="text-gray-200 font-medium">{currentPage}</span>
      </div>
    </div>
  );
}