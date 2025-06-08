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

  if (!product) {
    return <div className="section text-center">Товар не найден</div>;
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

  // Обработчик скролла для перемещения итога к форме
  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
          setShowPriceBox(false);
        } else {
          setShowPriceBox(true);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

	// Функция закрытия при прокрутке
	useEffect(() => {
		const handleScroll = () => {
			if (isCartOpen) setIsCartOpen(false);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [isCartOpen]);

  return (
    <div className="bg-light text-dark section">
      <Header />

      {/* Карточка товара всегда сверху */}
      <div className="top-20 z-30 bg-white rounded-lg p-6 mb-8">
        <div className="container mx-auto px-4">
          <Breadcrumbs currentPage={product.name} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img src={product.images[0]} alt={product.name} className="w-full rounded" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">{product.name}</h2>
              <p className="mb-4">{product.description}</p>

              <ul className="list-disc ml-5 mb-4">
                <li>Размер: {product.specs.size}</li>
                <li>Высота: {product.specs.height}</li>
                <li>Двигатель: {product.specs.engine || 'Не указан'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-7">
            {/* Аксессуары по категориям */}
            {Object.keys(product.accessories).length > 0 && (
              <h3 className="text-2xl font-bold mb-6">Аксессуары:</h3>
            )}

            {Object.entries(product.accessories).map(([category, accessories]) => (
              <div key={category} className="mb-10">
                <h4 className="text-xl font-semibold mb-4">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {accessories.map(acc => {
                    const isSelected = selectedAccessories[acc.id];
                    return (
                      <div
                        key={acc.id}
                        onClick={() => toggleAccessory(acc.id)}
                        className={`
                          group relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-300
                          ${isSelected 
                            ? 'border-primary bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-400'}
                        `}
                      >
                        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md mr-4">
                          <img
                            src={acc.image}
                            alt={acc.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-base truncate">{acc.name}</h5>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{acc.description}</p>
                          <p className="mt-1 font-bold text-primary">{acc.price.toLocaleString()} ₽</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Форма заявки (нижний блок) */}
            <div ref={formRef} className="mt-16 mb-32">
              <h4 className="text-2xl font-bold mb-4">Оформить заявку</h4>
              <form className="space-y-4">
                <input type="text" placeholder="Имя" className="w-full p-3 border rounded" />
                <input type="tel" placeholder="Телефон" className="w-full p-3 border rounded" />
                <textarea placeholder="Комментарий" className="w-full p-3 border rounded" rows={4}></textarea>
                <button type="submit" className="w-full bg-primary text-white py-3 rounded font-bold">
                  Отправить заявку
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Фиксированный флажок для десктопа */}
			{showPriceBox && (
				<div className="fixed bottom-8 right-8 z-50 hidden md:block animate-pulse-slow">
					<div className="bg-white shadow-xl rounded-lg p-4 border border-gray-200 max-w-xs">
						<div className="text-sm text-gray-500 mb-2">Выбрано:</div>
						{selectedAccList.length > 0 ? (
							selectedAccList.map(acc => (
								<div key={acc.id} className="flex justify-between text-sm">
									<span>{acc.name}</span>
									<span className="text-gray-700">{acc.price.toLocaleString()} ₽</span>
								</div>
							))
						) : (
							<div className="text-center text-gray-400 italic">Нет выбранных</div>
						)}
						<hr className="my-2 border-t border-gray-200" />
						<div className="font-bold text-lg text-right">Итого: {totalPrice.toLocaleString()} ₽</div>
					</div>
				</div>
			)}

			{/* Плавающий флажок рядом с формой (для десктопа) */}
			{!showPriceBox && (
				<div className="fixed right-8 top-[calc(100vh-200px)] z-50 hidden md:block animate-fade-in">
					<div className="bg-white shadow-xl rounded-lg p-4 border border-gray-200 max-w-xs">
						<div className="text-sm text-gray-500 mb-2">Выбрано:</div>
						{selectedAccList.length > 0 ? (
							selectedAccList.map(acc => (
								<div key={acc.id} className="flex justify-between text-sm">
									<span>{acc.name}</span>
									<span className="text-gray-700">{acc.price.toLocaleString()} ₽</span>
								</div>
							))
						) : (
							<div className="text-center text-gray-400 italic">Нет выбранных</div>
						)}
						<hr className="my-2 border-t border-gray-200" />
						<div className="font-bold text-lg text-right">Итого: {totalPrice.toLocaleString()} ₽</div>
					</div>
				</div>
			)}

			{/* Мобильная панель внизу экрана */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
				{/* Основная строка с ценой и кнопкой */}
				<div 
					className="flex justify-between items-center p-3"
					onClick={() => selectedAccList.length > 0 && setIsCartOpen(!isCartOpen)}
				>
					<div className="flex items-center space-x-2">
						{/* Иконка корзины или списка */}
						<button 
							className="text-gray-600 bg-gray-100 p-2 rounded-full relative"
							onClick={(e) => {
								e.stopPropagation();
								setIsCartOpen(!isCartOpen);
							}}
							aria-label="Показать выбранные аксессуары"
						>
							{/* Простая иконка корзины (можно заменить на SVG из библиотеки) */}
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M9 22H15a2 2 0 0 0 2-2H7a2 2 0 0 0 2 2z"></path>
								<path d="M8 12h.01M12 12h.01M16 12h.01M21 8l-5-5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path>
							</svg>

							{/* Индикатор наличия выбранных элементов */}
							{selectedAccList.length > 0 && (
								<span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
									{selectedAccList.length}
								</span>
							)}
						</button>

						{/* Текстовая часть */}
						<div>
							<div className="text-xs text-gray-500">Итого:</div>
							<div className="font-bold">{totalPrice.toLocaleString()} ₽</div>
						</div>
					</div>

					{/* Кнопка оформления */}
					<button
						className={`bg-primary text-white px-6 py-2 rounded-full font-semibold transition-transform ${
							selectedAccList.length === 0 ? 'opacity-50' : ''
						}`}
						onClick={(e) => {
							e.stopPropagation(); // предотвращаем двойное событие
							document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
						}}
						disabled={selectedAccList.length === 0}
					>
						Оформить
					</button>
				</div>

				{/* Блок с деталями заказа (раскрывается по клику) */}
				{isCartOpen && (
					<div className="bg-gray-50 border-t border-gray-200 p-3 animate-fadeIn">
						<div className="text-sm text-gray-600 mb-2">Выбрано:</div>
						{selectedAccList.length > 0 ? (
							selectedAccList.map(acc => (
								<div key={acc.id} className="flex justify-between text-sm py-1">
									<span>{acc.name}</span>
									<span>{acc.price.toLocaleString()} ₽</span>
								</div>
							))
						) : (
							<div className="text-center text-gray-400 italic">Нет выбранных аксессуаров</div>
						)}
						<hr className="my-2 border-t border-gray-200" />
						<div className="flex justify-between font-bold text-base">
							<span>Общая цена:</span>
							<span>{totalPrice.toLocaleString()} ₽</span>
						</div>
					</div>
				)}
			</div>
    </div>
  );
}