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

	// Расширенные характеристики
	extendedSpecs?: {
		wheelFormula?: string;
		weight?: string;
		fullWeight?: string;
		enginePower?: string;
		torque?: string;
		slope?: string;
		lateralStability?: string;
		suspension?: string;
		steering?: string;
		brakeSystem?: string;
		parkingBrake?: string;
		tires?: string;
		tirePressure?: string;
		waterSpeed?: string;
	};
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
	deskSmall: string;
	price: number;
	images: string[];
	specs: Spec;
	defaultKit: DefaultKit[]; // <-- Новое поле
	accessories: Record<string, Accessory[]>;
};

export type NewsItem = {
	id: number;
	title: string;
	content: string;
	date: string;
	image: string;
	summary?: string;
	tags?: string[];
	isPinned?: boolean;
};