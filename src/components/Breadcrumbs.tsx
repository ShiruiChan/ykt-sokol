import { Link } from 'react-router-dom';

interface Props {
	currentPage: string;
}

export default function Breadcrumbs({ currentPage }: Props) {
	return (
		<div className="bg-gray-200 py-3 px-6">
			<div className="container mx-auto text-sm text-gray-600">
				<Link to="/" className="hover:text-orange-500">Главная</Link> /{' '}
				<span className="text-gray-800 font-medium">{currentPage}</span>
			</div>
		</div>
	);
}