const Header = () => {
	return (
		<header className="bg-gray-900 text-white p-4">
			<div className="container mx-auto flex justify-between items-center">
				<h1 className="text-xl font-bold">БТС-Квадро</h1>
				<nav>
					<ul className="flex gap-6">
						<li><a href="/" className="hover:text-orange-500">Главная</a></li>
						<li><a href="/news" className="hover:text-orange-500">Новости</a></li>
					</ul>
				</nav>
			</div>
		</header>
	);
};

export default Header;