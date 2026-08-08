import { Link } from 'react-router-dom';
import { ArrowLeft } from './Icons';

/** Хлебные крошки + явный путь назад: тупиков в навигации быть не должно. */
export default function Breadcrumbs({ currentPage }: { currentPage: string }) {
	return (
		<nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-sm text-fog-500">
			<Link
				to="/"
				className="inline-flex items-center gap-1.5 transition-colors hover:text-fog-50"
			>
				<ArrowLeft className="h-4 w-4" />
				Главная
			</Link>
			<span aria-hidden className="text-fog-500/60">
				/
			</span>
			<span className="truncate text-fog-200">{currentPage}</span>
		</nav>
	);
}
