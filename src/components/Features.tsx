export default function Features() {
	return (
		<section className="bg-dark section text-white">
			<div className="container mx-auto px-4">
				<h2 className="text-4xl text-center mb-16">Наши преимущества</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
					<div className="text-center">
						<div className="text-5xl text-primary mb-4">🔧</div>
						<h3 className="text-2xl font-bold mb-4">Проходимость</h3>
						<p className="text-orange-400">Усиленная рама и колеса повышенной проходимости</p>
					</div>
					<div className="text-center">
						<div className="text-5xl text-primary mb-4">⚙️</div>
						<h3 className="text-2xl font-bold mb-4">Мощность</h3>
						<p className="text-orange-400">Высокая производительность даже в сложных условиях</p>
					</div>
					<div className="text-center">
						<div className="text-5xl text-primary mb-4">🚚</div>
						<h3 className="text-2xl font-bold mb-4">Надежность</h3>
						<p className="text-orange-400">Используем только проверенные комплектующие</p>
					</div>
				</div>
			</div>
		</section>
	);
}