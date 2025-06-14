export default function Features() {
	return (
		<section className="section bg-gray-900 text-gray-200">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold mb-12 text-center">Почему выбирают нас?</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="text-center">
						<div className="text-5xl mb-4">🛞</div>
						<h3 className="text-xl font-semibold mb-2">Проходимость</h3>
						<p>Усиленная рама и колеса повышенной проходимости.</p>
					</div>
					<div className="text-center">
						<div className="text-5xl mb-4">🔩</div>
						<h3 className="text-xl font-semibold mb-2">Надежность</h3>
						<p>Используем только проверенные комплектующие.</p>
					</div>
					<div className="text-center">
						<div className="text-5xl mb-4">🛠️</div>
						<h3 className="text-xl font-semibold mb-2">Сервис и поддержка</h3>	
						<p>Гарантия, обслуживание и запчасти — всё от одного производителя.</p>
					</div>
				</div>
			</div>
		</section>
	);
}