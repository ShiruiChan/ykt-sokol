import { Product } from '../types';

export const products: Product[] = [
	{
		id: 1,
		name: "X-1",
		description: "Высокая проходимость и надежность",
		price: "от 450 000 ₽",
		image: "/images/quad-1.jpg",
		specs: {
			engine: "1000 см³",
			weight: "450 кг",
			capacity: "200 кг"
		},
		accessories: [
			{ name: "Лебёдка", price: "30 000 ₽", image: "/images/addition-1.jpg" },
			{ name: "Подогрев ручек", price: "15 000 ₽", image: "/images/addition-2.jpg" }
		]
	},
	{
		id: 2,
		name: "X-200",
		description: "Для охотников и путешествий",
		price: "от 520 000 ₽",
		image: "/images/quad-2.jpg",
		specs: {
			engine: "1200 см³",
			weight: "500 кг",
			capacity: "250 кг"
		},
		accessories: [
			{ name: "Фаркоп", price: "20 000 ₽", image: "/images/addition-3.jpg" }
		]
	}
];