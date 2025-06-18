import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import { useState, useEffect, useRef } from 'react';
import type { Accessory } from '../types';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function ProductPage() {
	const { id } = useParams<{ id: string }>();
	const product = products.find(p => p.id === Number(id));
	const [selectedAccessories, setSelectedAccessories] = useState<Record<number, boolean>>({});
	const [showPriceBox, setShowPriceBox] = useState(true);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [expandedSections, setExpandedSections] = useState<string[]>(['']); // по умолчанию показаны характеристики

	const formRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [id]);

	if (!product) {
		return <div className="section text-center text-gray-300">Товар не найден</div>;
	}

	const toggleAccessory = (accId: number) => {
		setSelectedAccessories(prev => ({
			...prev,
			[accId]: !prev[accId]
		}));
	};

	const selectedAccList = Object.entries(selectedAccessories)
		.filter(([, isSelected]) => isSelected)
		.map(([accId]) => {
			for (const category in product.accessories) {
				const found = product.accessories[category].find(acc => acc.id === Number(accId));
				if (found) return found;
			}
			return null;
		})
		.filter(Boolean) as Accessory[];

	const toggleSection = (section: string) => {
		setExpandedSections(prev =>
			prev.includes(section)
				? prev.filter(s => s !== section)
				: [...prev, section]
		);
	};

	// Отслеживаем положение формы
	useEffect(() => {
		const handleScroll = () => {
			if (formRef.current) {
				const rect = formRef.current.getBoundingClientRect();

				// Показываем боковую панель, если пользователь почти добрался до формы
				setShowPriceBox(rect.top < window.innerHeight * 0.9);

				// На больших экранах — автоматически открываем корзину
				if (!isCartOpen && window.innerWidth >= 768 && rect.top < window.innerHeight * 0.8) {
					setIsCartOpen(true);
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const totalPrice = product.price + selectedAccList.reduce((sum, acc) => sum + acc.price, 0);

	useEffect(() => {
		const handleScroll = () => {
			if (formRef.current) {
				const rect = formRef.current.getBoundingClientRect();
				setShowPriceBox(rect.top > window.innerHeight * 0.8);
			}
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			if (isCartOpen) setIsCartOpen(false);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [isCartOpen]);

	return (
		<div className="bg-neutral-900/40 text-gray-200 mt-16">
			<Header />
			<div className="z-30 bg-neutral-800 rounded-lg p-6 mb-8 shadow-2xl -mt-4">
				<div className="container mx-auto px-4">
					<Breadcrumbs currentPage={product.name} />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<img src={product.images[0]} alt={`${product.name} - квадроцикл`} className="w-full rounded-lg shadow-md border-2 border-gray-500" />
						</div>
						<div>
							<h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-100">{product.name}</h2>
							<p className="mb-4 text-gray-400 leading-relaxed">{product.description}</p>

							{/* Характеристики */}
							<div className="mt-6">
								<div
									onClick={() => toggleSection("specs")}
									className="flex justify-between items-center cursor-pointer"
								>
									<h3 className="text-2xl font-semibold text-gray-100">Характеристики</h3>
									<h3 className="text-gray-300 underline">
										{expandedSections.includes("specs") ? "Скрыть" : "Показать всё"}
									</h3>
								</div>

								{/* Адаптивная сетка вместо таблицы */}
								<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
									{/* Основные характеристики */}
									{product.specs.size && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Размер</div>
											<div className="text-gray-400">{product.specs.size}</div>
										</>
									)}

									{product.specs.height && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Высота</div>
											<div className="text-gray-400">{product.specs.height}</div>
										</>
									)}

									{product.specs.engine && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Двигатель</div>
											<div className="text-gray-400">{product.specs.engine}</div>
										</>
									)}

									{product.specs.clearance && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Клиренс</div>
											<div className="text-gray-400">{product.specs.clearance}</div>
										</>
									)}

									{product.specs.transmission && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Трансмиссия</div>
											<div className="text-gray-400">{product.specs.transmission}</div>
										</>
									)}

									{product.specs.seats && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Мест</div>
											<div className="text-gray-400">{product.specs.seats}</div>
										</>
									)}

									{product.specs.maxSpeed && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Макс. скорость</div>
											<div className="text-gray-400">{product.specs.maxSpeed}</div>
										</>
									)}

									{product.specs.fuelConsumption && (
										<>
											<div className="font-semibold text-gray-300 border-b border-gray-600">Расход топлива</div>
											<div className="text-gray-400">{product.specs.fuelConsumption}</div>
										</>
									)}

									{/* Расширенные характеристики — только если пользователь нажал "Показать всё" */}
									{expandedSections.includes("specs") && product.specs.extendedSpecs && (
										<>
											{Object.entries(product.specs.extendedSpecs).map(([key, value]) => {
												const specLabels: Record<string, string> = {
													wheelFormula: "Колёсная формула",
													weight: "Масса снаряжённого ТС",
													fullWeight: "Полная масса ТС",
													enginePower: "Мощность двигателя",
													torque: "Максимальный крутящий момент",
													slope: "Максимально преодолеваемый уклон",
													lateralStability: "Угол поперечной устойчивости",
													suspension: "Подвеска",
													steering: "Рулевое управление",
													brakeSystem: "Тормозная система",
													parkingBrake: "Стояночная тормозная система",
													tires: "Шины",
													tirePressure: "Давление воздуха в шинах",
													waterSpeed: "Скорость на плаву"
												};
												const label = specLabels[key] || key;
												return (
													value && (
														<>
															<div className="font-semibold text-gray-300 border-b border-gray-600">{label}</div>
															<div className="text-gray-400">{value}</div>
														</>
													)
												);
											})}
										</>
									)}
								</div>
							</div>

							{/* Комплектация по умолчанию */}
							<div className="mt-6">
								<div
									onClick={() => toggleSection("kit")}
									className="flex justify-between items-center cursor-pointer"
								>
									<h3 className="text-2xl font-semibold text-gray-100">Комплектация по умолчанию</h3>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className={`transition-transform duration-300 ${expandedSections.includes("kit") ? "rotate-180" : ""
											}`}
									>
										<polyline points="6 9 12 15 18 9"></polyline>
									</svg>
								</div>
								{expandedSections.includes("kit") && (
									<ul className="list-disc pl-6 mt-4 space-y-1">
										{product.defaultKit.map((item, index) => (
											<li key={index} className="text-gray-400">
												<span className="font-medium">{item.name}</span> — {item.quantity}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Аксессуары */}
			<div className="container mx-auto px-4 mt-8">
				<h3 className="text-3xl font-bold mb-6 text-gray-100">Аксессуары:</h3>
				{/* Аксессуары */}
				{Object.entries(product.accessories).map(([category, accessories]) => (
					<div key={category} className="mt-6">
						<div
							onClick={() => toggleSection(`accessory-${category}`)}
							className="flex items-center cursor-pointer"
						>
							<h4 className="text-xl font-semibold mb-4 text-gray-300">{category}</h4>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={`transition-transform duration-300 -mt-3 ml-2 ${expandedSections.includes(`accessory-${category}`) ? "rotate-180" : ""
									}`}
							>
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						</div>

						{expandedSections.includes(`accessory-${category}`) && (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
								{accessories.map((acc) => {
									const isSelected = selectedAccessories[acc.id];
									return (
										<div
											key={acc.id}
											onClick={() => toggleAccessory(acc.id)}
											className={`
												group relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-300
												${isSelected ? "border-gray-500 bg-neutral-700/60" : "border-gray-600 hover:border-gray-400"}
											`}
										>
											<div className="relative w-full h-24 overflow-hidden rounded-md mb-3 flex items-center justify-center">
												<img
													src={acc.image}
													alt={`${acc.name} - аксессуар`}
													className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
												/>
											</div>
											<div className="flex-1 min-w-0">
												<h5 className="font-semibold text-base text-gray-200">{acc.name}</h5>
												<p className="text-sm text-gray-500 mt-1">{acc.description}</p>
												<p className="mt-2 font-bold text-gray-300">{acc.price.toLocaleString()} ₽</p>
											</div>
											<div className="absolute top-2 right-2 border border-gray-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"></div>
											{isSelected && (
												<div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-green-600 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
													✓
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				))}

				{/* Форма заявки */}
				<div className="flex flex-col md:flex-row gap-8 pt-10">
					{/* Левая часть — форма */}
					<div ref={formRef} id="form-section" className="w-full md:w-2/3">
						<h4 className="text-2xl font-bold mb-4 text-gray-100">Оформить заявку</h4>
						{/* верхняя часть — корзина с ценой для мобилок*/}
						{!showPriceBox && (
							<div className="w-full z-50 md:hidden">
								<div className="sticky top-24 bg-neutral-800 shadow-xl rounded-lg p-4 border border-gray-600 max-h-[340px] overflow-y-auto animate-fadeIn">
									<div className="text-sm text-gray-500 mb-2">Выбрано:</div>

									{/* Основной товар */}
									<div className="mb-3">
										<div className="flex items-center gap-2">
											<img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
											<div>
												<div className="font-medium text-gray-200">{product.name}</div>
												<div className="text-green-400 font-bold">{product.price.toLocaleString()} ₽</div>
											</div>
										</div>
									</div>

									{/* Аксессуары */}
									{selectedAccList.length > 0 ? (
										selectedAccList.map(acc => (
											<div key={acc.id} className="flex justify-between text-sm py-1">
												<span className="text-gray-300">{acc.name}</span>
												<span className="text-gray-400">{acc.price.toLocaleString()} ₽</span>
											</div>
										))
									) : (
										<div className="text-center text-gray-600 italic">Нет выбранных аксессуаров</div>
									)}

									<hr className="my-4 border-t border-gray-600" />
									<div className="font-bold text-lg text-right text-green-400">
										Итого: {totalPrice.toLocaleString()} ₽
									</div>
								</div>
							</div>
						)}
						<div className="bg-neutral-800 p-6 rounded-lg shadow-lg border border-gray-700 mt-4 md:mt-0">
							<div className="space-y-5">
								<div>
									<label className="block text-gray-300 font-medium mb-2">Имя</label>
									<input
										type="text"
										placeholder="Ваше имя"
										className="w-full p-3 border border-gray-600 rounded bg-zinc-300 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition"
									/>
								</div>

								<div>
									<label className="block text-gray-300 font-medium mb-2">Телефон или Email</label>
									<input
										type="tel"
										placeholder="+7 (999) 999-99-99"
										className="w-full p-3 border border-gray-600 rounded bg-zinc-300 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition"
									/>
								</div>

								<div>
									<label className="block text-gray-300 font-medium mb-2">Комментарий</label>
									<textarea
										placeholder="Дополнительные пожелания"
										rows={4}
										className="w-full p-3 border border-gray-600 rounded bg-zinc-300 text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition"
									></textarea>
								</div>

								<button className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:bg-teal-400 text-white py-3 px-6 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
									Отправить заявку
								</button>
							</div>
						</div>
					</div>

					{/* Правая часть — корзина с ценой для пк*/}
					{!showPriceBox && (
						<div className="w-full md:w-1/3 z-2 pt-12 hidden md:block">
							<div className="sticky top-24 bg-neutral-800 shadow-xl rounded-lg p-4 border border-gray-600 max-h-[340px] overflow-y-auto animate-fadeIn">
								<div className="text-sm text-gray-500 mb-2">Выбрано:</div>
								{/* Основной товар */}
								<div className="mb-4">
									<div className="text-sm text-gray-500 mb-2">Основное:</div>
									<div className="flex items-center gap-2">
										<img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
										<div>
											<div className="font-medium text-gray-200">{product.name}</div>
											<div className="text-green-400 font-bold">{product.price.toLocaleString()} ₽</div>
										</div>
									</div>
								</div>

								{/* Аксессуары */}
								{selectedAccList.length > 0 ? (
									<>
										<div className="text-sm text-gray-500 mb-2 mt-4">Дополнительно:</div>
										{selectedAccList.map(acc => (
											<div key={acc.id} className="flex justify-between text-sm py-1">
												<span className="text-gray-300">{acc.name}</span>
												<span className="text-gray-400">{acc.price.toLocaleString()} ₽</span>
											</div>
										))}
									</>
								) : (
									<div className="text-center text-gray-500 italic">Нет выбранных аксессуаров</div>
								)}
								<hr className="my-4 border-t border-gray-600" />
								<div className="font-bold text-lg text-right text-green-400">
									Итого: {totalPrice.toLocaleString()} ₽
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Блок "Другие модели" всегда виден внизу */}
			<div className="mt-12 container mx-auto px-4 mb-20">
				<h3 className="text-2xl font-semibold mb-4">Другие модели</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{products
						.filter(p => p.id !== product.id)
						.slice(0, 3)
						.map(p => (
							<div key={p.id} className="card">
								<img src={p.images[0]} alt={`${p.name} - квадроцикл`} className="w-full h-64 object-cover" />
								<div className="p-4 flex justify-between">
									<div className=''>
										<h4 className="text-lg font-semibold text-black">{p.name}</h4>
										<p className="text-black text-sm">{p.price.toLocaleString()} ₽</p>
									</div>
									<Link to={`/product/${p.id}`} className="btn-primary inline-block">
										Подробнее
									</Link>
								</div>
							</div>
						))}
				</div>
			</div>

			{/* Корзина с ценой (для десктопа) */}
			{showPriceBox && (
				<div className="fixed right-8 bottom-8 z-50 hidden md:block bg-neutral-700/60 shadow-xl rounded-lg p-4 border border-gray-600 max-w-xs transition-transform duration-300 animate-fadeIn">
					{/* Основной товар */}
					<div className="mb-4">
						<div className="text-sm text-gray-500 mb-2">Основное:</div>
						<div className="flex items-center gap-2">
							<img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
							<div>
								<div className="font-medium text-gray-200">{product.name}</div>
								<div className="text-green-400 font-bold">{product.price.toLocaleString()} ₽</div>
							</div>
						</div>
					</div>

					{/* Аксессуары */}
					{selectedAccList.length > 0 ? (
						<>
							<div className="text-sm text-gray-500 mb-2 mt-4">Дополнительно:</div>
							{selectedAccList.map(acc => (
								<div key={acc.id} className="flex justify-between text-sm py-1">
									<span className="text-gray-300">{acc.name}</span>
									<span className="text-gray-400">{acc.price.toLocaleString()} ₽</span>
								</div>
							))}
						</>
					) : (
						<div className="text-center text-gray-500 italic">Нет выбранных аксессуаров</div>
					)}

					<hr className="my-2 border-t border-gray-600" />
					<div className="font-bold text-lg text-right text-green-400">
						Итого: {totalPrice.toLocaleString()} ₽
					</div>
				</div>
			)}

			{/* Мобильная корзина (внизу) */}
			{showPriceBox && (
				<div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900/70 backdrop-blur-md border-gray-700/50 shadow-lg border-t z-50">
					<div
						className="flex justify-between items-center p-3"
						onClick={() => selectedAccList.length > 0 && setIsCartOpen(!isCartOpen)}
					>
						<div className="flex items-center space-x-2">
							<button
								className="text-gray-400 bg-gray-700 p-2 rounded-full relative"
								onClick={(e) => {
									e.stopPropagation();
									setIsCartOpen(!isCartOpen);
								}}
								aria-label="Показать выбранные аксессуары"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M9 22H15a2 2 0 0 0 2-2H7a2 2 0 0 0 2 2z" />
									<path d="M8 12h.01M12 12h.01M16 12h.01M21 8l-5-5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z" />
								</svg>
								{selectedAccList.length > 0 && (
									<span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
										{selectedAccList.length}
									</span>
								)}
							</button>
							<div>
								<div className="text-xs">Итого:</div>
								<div className="font-bold text-gray-300">{totalPrice.toLocaleString()} ₽</div>
							</div>
						</div>
						<button
							className={`px-6 py-2 rounded-full font-semibold ${selectedAccList.length === 0 ? 'opacity-50' : ''}`}
							disabled={selectedAccList.length === 0}
							onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
						>
							Оформить
						</button>
					</div>

					{/* Раскрывающийся список аксессуаров на мобильных устройствах */}
					{isCartOpen && (
						<div className="bg-neutral-800 border-t border-gray-600 p-3 animate-fadeIn">
							{/* Основной товар */}
							<div className="mb-4">
								<div className="text-sm text-gray-500 mb-2">Основное:</div>
								<div className="flex items-center gap-2">
									<img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
									<div>
										<div className="font-medium text-gray-200">{product.name}</div>
										<div className="text-green-400 font-bold">{product.price.toLocaleString()} ₽</div>
									</div>
								</div>
							</div>

							{/* Аксессуары */}
							{selectedAccList.length > 0 && (
								<>
									<div className="text-sm text-gray-500 mb-2 mt-4">Дополнительно:</div>
									{selectedAccList.map(acc => (
										<div key={acc.id} className="flex justify-between text-sm py-1">
											<span className="text-gray-300">{acc.name}</span>
											<span className="text-gray-400">{acc.price.toLocaleString()} ₽</span>
										</div>
									))}
								</>
							)}

							<hr className="my-2 border-t border-gray-600" />
							<div className="flex justify-between font-bold text-base">
								<span className="text-gray-300">Общая цена:</span>
								<span className="text-gray-300">{totalPrice.toLocaleString()} ₽</span>
							</div>
						</div>
					)}
				</div>
			)}

			<Footer />
		</div>
	);
}