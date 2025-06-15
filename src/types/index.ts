// Тип аксессуара
export type Accessory = {
	id: number;
	name: string;
	description: string;
	price: number; // важно: число, а не строка!
	image: string;
};

export type Spec = {
  size: string;
  height: string;
  engine?: string;
  clearance?: string;
  transmission?: string;
  seats?: string;
  maxSpeed?: string;
  fuelConsumption?: string;
};

// Комплектация по умолчанию
export type DefaultKit = {
  name: string;
  quantity: string;
};

// Тип продукта
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  specs: Spec;
  defaultKit: DefaultKit[]; // <-- Новое поле
  accessories: Record<string, Accessory[]>;
};