import { useState } from 'react';
import Modal from './Modal';
import ImageGallery from './ImageGallery';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Импорт Framer Motion
import type { Product } from '../types';

interface Props {
	product: Product;
}

export default function ProductCard({ product }: Props) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	// Проверяем наличие изображений
	const hasImages = product.images && product.images.length > 0;

	// Функция для переключения слайдов
	const handleNextSlide = () => {
		setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % product.images.length);
	};

	const handlePrevSlide = () => {
		setCurrentSlideIndex((prevIndex) =>
			prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
		);
	};

	return (
		<>
			<div className="bg-zinc-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md w-full mx-auto">
				{/* Блок изображения или placeholder */}
				<div
					className="w-full h-64 relative flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 cursor-pointer"
				>
					{hasImages ? (
						<motion.div
							key={currentSlideIndex}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5 }}
							className="w-full h-full"
						>
							<img
								src={product.images[currentSlideIndex]}
								alt={`${product.name} - квадроцикл`}
								className="object-cover w-full h-full"
							/>
						</motion.div>
					) : (
						<div className="text-center p-4 text-gray-700">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 mx-auto mb-2 opacity-70"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<p className="text-sm font-medium">Фото пока нет</p>
						</div>
					)}

					{/* Кнопки навигации по слайдеру */}
					{hasImages && (
						<div className="absolute inset-0 flex items-center justify-between px-4">
							<button
								onClick={handlePrevSlide}
								className="text-gray-500 hover:text-gray-700 focus:outline-none"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 19l-7-7 7-7"
									/>
								</svg>
							</button>
							<button
								onClick={handleNextSlide}
								className="text-gray-500 hover:text-gray-700 focus:outline-none"
							>
								<svg
									className="h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</button>
						</div>
					)}
				</div>

				{/* Ссылка на страницу товара */}
				<Link to={`/product/${product.id}`} className="block p-4 pb-0 z-10">
					{/* Заголовок и цена */}
					<div className="flex justify-between items-start mb-2">
						<h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
						<span className="text-green-600 font-bold text-lg">{product.price.toLocaleString()} ₽</span>
					</div>

					{/* Краткое описание */}
					<p className="text-gray-500 text-sm mb-3">{product.deskSmall}</p>

					{/* Характеристики */}
					<div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-500 mb-4">
						<div className="flex flex-col">
							<span className="font-semibold text-gray-700">Двигатель:</span>
							<span className="text-gray-800">{product.specs.engine}</span>
						</div>
						<div className="flex flex-col">
							<span className="font-semibold text-gray-700">Размер:</span>
							<span className="text-gray-800">{product.specs.size}</span>
						</div>
						<div className="flex flex-col">
							<span className="font-semibold text-gray-700">Скорость:</span>
							<span className="text-gray-800">{product.specs.maxSpeed}</span>
						</div>
						<div className="flex flex-col">
							<span className="font-semibold text-gray-700">Клиренс:</span>
							<span className="text-gray-800">{product.specs.clearance}</span>
						</div>
					</div>
				</Link>

				{/* Действия */}
				<div className="block p-4 pt-0 z-1">
					<div className="flex gap-2 mt-4 z-10">
						<button
							onClick={() => hasImages && setIsModalOpen(true)}
							disabled={!hasImages}
							className={`flex-1 py-2 px-4 rounded-md transition ${hasImages
								? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
								: 'bg-gray-200 text-gray-500 cursor-not-allowed'
								}`}
						>
							Галерея
						</button>
						<Link
							to={`/product/${product.id}`}
							className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-md transition text-center"
						>
							Подробнее
						</Link>
					</div>
				</div>
			</div>

			{/* Модальное окно с галереей */}
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<div className="text-center bg-neutral-800 p-6 rounded-lg">
					<h2 className="text-2xl font-bold mb-4 text-zinc-300">{product.name}</h2>

					{hasImages ? (
						<ImageGallery images={product.images} />
					) : (
						<p className="text-gray-400 py-6">Изображений пока нет</p>
					)}

					<div className="mt-4">
						<Link
							to={`/product/${product.id}`}
							className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition"
							onClick={() => setIsModalOpen(false)}
						>
							Перейти к товару
						</Link>
					</div>
				</div>
			</Modal>
		</>
	);
}