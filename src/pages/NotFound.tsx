export default function NotFound() {
	return (
		<div className="container mx-auto py-20 text-center">
			<h1 className="text-4xl font-bold mb-4">404 — Страница не найдена</h1>
			<p className="mb-6">Кажется, такой страницы нет. Попробуйте вернуться на главную.</p>
			<a href="/" className="inline-block bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600">
				На главную
			</a>
		</div>
	);
}