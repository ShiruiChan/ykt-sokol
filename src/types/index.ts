// Тип аксессуара
export type Accessory = {
	id: number;
	name: string;
	description: string;
	price: number; // важно: число, а не строка!
	image: string;
};

// Основные параметры техники
export type Spec = {
	size: string; // Габариты (длина × ширина)
	height: string; // Высота
	engine?: string; // Модель двигателя
	clearance?: string; // Клиренс
	transmission?: string; // Трансмиссия
	seats?: string; // Количество мест
	fuelConsumption?: string; // Расход топлива
	maxSpeed?: string; // Максимальная скорость
};

// Основной тип продукта
export type Product = {
	id: number;
	name: string;
	description: string;
	price: number; // важно: число, а не строка!
	images: string[];
	specs: Spec;
	accessories: Record<string, Accessory[]>; // объект с категориями аксессуаров
};

// Тип новости/акции
export type NewsItem = {
	title: string;
	content: string;
	image?: string;
	date?: string;
};