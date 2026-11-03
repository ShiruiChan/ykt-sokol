// Тип аксессуара
export type Accessory = {
	id: number;
	name: string;
	description: string;
	price: number; // важно: число, а не строка!
	/** Фото аксессуара. Пока снимков нет — поле не заполняется и не выводится */
	image?: string;
};

export type Spec = {
	size?: string;
	height?: string;
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
	/** Адрес страницы модели: /models/<slug> */
	slug: string;
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
	/** Превью. Нет — карточка рисуется типографикой, без заглушки */
	image?: string;
	summary?: string;
	/** Ссылка на первоисточник публикации */
	sourceUrl?: string;
	/** Название издания или канала */
	sourceName?: string;
	tags?: string[];
	isPinned?: boolean;
};
/** Частый вопрос. Ответ — простая строка: из неё же собирается разметка FAQPage */
export type FaqItem = {
	q: string;
	a: string;
	/** Показывать в коротком блоке на главной */
	home?: boolean;
};

/** Документ на странице «Документы» (PDF) */
export type DocumentItem = {
	id: string;
	url: string;
	title: string;
	description?: string;
};

export interface PhoneContact {
	/** Для ссылки tel: — только цифры и плюс */
	href: string;
	/** Как показываем людям */
	label: string;
}

/** Контакты, адрес и часы — content/site.json */
export type SiteContent = {
	phones: { main: PhoneContact; extra: PhoneContact };
	address: { city: string; street: string; full: string; short: string; routeUrl: string };
	hours: {
		label: string;
		short: string;
		/** Для schema.org, ЧЧ:ММ */
		opens: string;
		closes: string;
	};
	messengers: { whatsapp: string; telegram: string };
};
