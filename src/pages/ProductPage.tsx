import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import Breadcrumbs from '../components/Breadcrumbs';
import Header from '../components/Header';
import { useState, useEffect, useRef } from 'react';
import type { Accessory } from '../types';

export default function ProductPage() {
	const { id } = useParams<{ id: string }>();
	const product = products.find(p => p.id === Number(id));
	const [selectedAccessories, setSelectedAccessories] = useState<Record<number, boolean>>({});
	const [showPriceBox, setShowPriceBox] = useState(true);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const formRef = useRef<HTMLDivElement>(null);

	// Прокрутка к началу страницы при загрузке
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [id]); // Зависимость от id, чтобы прокрутка срабатывала при смене продукта

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
		<div className="bg-gray-900 text-gray-200 section">
			<Header />

			<div className="z-30 bg-gray-800 rounded-lg p-6 mb-8 shadow-2xl -mt-4">
				<div className="container mx-auto px-4">
					<Breadcrumbs currentPage={product.name} />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<img src={product.images[0]} alt={`${product.name} - квадроцикл`} className="w-full rounded-lg shadow-md border-2 border-gray-500" />
						</div>
						<div>
							<h2 className="text-4xl font-extrabold mb-4 text-gray-100">{product.name}</h2>
							<p className="mb-4 text-gray-400">{product.description}</p>

							<ul className="list-none mb-4 space-y-2">
								<li><span className="font-semibold text-gray-300">Размер:</span> {product.specs.size}</li>
								<li><span className="font-semibold text-gray-300">Высота:</span> {product.specs.height}</li>
								<li><span className="font-semibold text-gray-300">Двигатель:</span> {product.specs.engine || 'Не указан'}</li>
								<li><span className="font-semibold text-gray-300">Клиренс:</span> {product.specs.clearance || 'Не указан'}</li>
								<li><span className="font-semibold text-gray-300">Трансмиссия:</span> {product.specs.transmission || 'Не указана'}</li>
								<li><span className="font-semibold text-gray-300">Мест:</span> {product.specs.seats || 'Не указано'}</li>
								<li><span className="font-semibold text-gray-300">Макс. скорость:</span> {product.specs.maxSpeed || 'Не указана'}</li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					<div className="lg:col-span-7">
						{Object.keys(product.accessories).length > 0 && (
							<h3 className="text-3xl font-bold mb-6 text-gray-100">Аксессуары:</h3>
						)}
						{Object.entries(product.accessories).map(([category, accessories]) => (
							<div key={category} className="mb-10">
								<h4 className="text-xl font-semibold mb-4 text-gray-300">{category}</h4>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
									{accessories.map(acc => {
										const isSelected = selectedAccessories[acc.id];
										return (
											<div
												key={acc.id}
												onClick={() => toggleAccessory(acc.id)}
												className={`
									group relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all duration-300
									${isSelected
														? 'border-gray-500 bg-gray-700'
														: 'border-gray-600 hover:border-gray-400'}
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
												{isSelected && (
													<div className="absolute top-2 right-2 bg-gray-500 text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
														✓
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						))}

						<div ref={formRef} id="form-section" className="mt-16 mb-32">
							<h4 className="text-2xl font-bold mb-4 text-gray-100">Оформить заявку</h4>
							<div className="space-y-4">
								<input type="text" placeholder="Имя" className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-400" />
								<input type="tel" placeholder="Телефон" className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-400" />
								<textarea placeholder="Комментарий" className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-400" rows={4}></textarea>
								<button className="w-full bg-gray-500 text-gray-900 py-3 rounded font-bold hover:bg-gray-400 transition-colors">
									Отправить заявку
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{showPriceBox && (
				<div className="fixed bottom-8 right-8 z-50 hidden md:block animate-pulse-slow">
					<div className="bg-gray-800 shadow-xl rounded-lg p-4 border border-gray-600 max-w-xs">
						<div className="text-sm text-gray-500 mb-2">Выбрано:</div>
						{selectedAccList.length > 0 ? (
							selectedAccList.map(acc => (
								<div key={acc.id} className="flex justify-between text-sm">
									<span className="text-gray-300">{acc.name}</span>
									<span className="text-gray-400">{acc.price.toLocaleString()} ₽</span>
								</div>
							))
						) : (
							<div className="text-center text-gray-600 italic">Нет выбранных</div>
						)}
						<hr className="my-2 border-t border-gray-600" />
						<div className="font-bold text-lg text-right text-gray-300">Итого: {totalPrice.toLocaleString()} ₽</div>
					</div>
				</div>
			)}

			{!showPriceBox && (
				<div className="fixed right-8 top-[calc(100vh-200px)] z-50 hidden md:block animate-fade-in">
					<div className="bg-gray-800 shadow-xl rounded-lg p-4 border border-gray-600 max-w-xs">
						<div className="text-sm text-gray-500 mb-2">Выбрано:</div>
						{selectedAccList.length > 0 ? (
							selectedAccList.map(acc => (
								<div key={acc.id} className="flex justify-between text-sm">
									<span className="text-gray-300">{acc.name}</span>
									<span className="text-gray-400">{acc.price.toLocaleString()} ₽</span>
								)</div>
							))
						) : (
							<div className="text-center text-gray-600 italic">Нет выбранных</div>
						)}
						<hr className="my-2 border-t border-gray-600" />
						<div className="font-bold text-lg text-right text-gray-300">Итого: {totalPrice.toLocaleString()} ₽</div>
					</div>
				</div>
			)}

			<div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 shadow-lg border-t border-gray-600 z-50">
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
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9 22H15a2 2 0 0 0 2-2H7a2 2 0 0 0 2 2z"></path>
								<path d="M8 12h.01M12 12h.01M16 12h.01M21 8l-5-5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path>
							</svg>
							{selectedAccList.length > 0 && (
								<span className="absolute -top-1 -right-1 bg-gray-500 text-gray-900 text-xs w-5 h-5 flex items-center justify-center rounded-full">
									{selectedAccList.length}
								</span>
							)}
						</button>
						<div>
							<div className="text-xs text-gray-500">Итого:</div>
							<div className="font-bold text-gray-300">{totalPrice.toLocaleString()} ₽</div>
						</div>
					</div>
					<button
						className={`bg-gray-500 text-gray-900 px-6 py-2 rounded-full font-semibold transition-transform ${selectedAccList.length === 0 ? 'opacity-50' : ''
							}`}
						onClick={(e) => {
							e.stopPropagation();
							document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
						}}
						disabled={selectedAccList.length === 0}
					>
						Оформить
					</button>
				</div>

				{isCartOpen && (
					<div className="bg-gray-700 border-t border-gray-600 p-3 animate-fadeIn">
						<div className="text-sm text-gray-500 mb-2">Выбрано:</div>
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
						<hr className="my-2 border-t border-gray-600" />
						<div className="flex justify-between font-bold text-base">
							<span className="text-gray-300">Общая цена:</span>
							<span className="text-gray-300">{totalPrice.toLocaleString()} ₽</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}