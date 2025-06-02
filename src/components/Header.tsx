import { Link } from 'react-router-dom';

export default function Header() {
	return (
		<header className="bg-dark text-white p-4 shadow-md">
			<div className="container mx-auto flex justify-between items-center">
				<h1 className="text-xl font-bold">YktSokol</h1>
				<nav>
					<ul className="flex gap-6">
						<li><Link to="/" className="hover:text-orange-500">Главная</Link></li>
						<li><Link to="/news" className="hover:text-orange-500">Новости</Link></li>
					</ul>
				</nav>
			</div>
		</header>
	);
}