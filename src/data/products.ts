import type { Product } from '../types';

export const products: Product[] = [
	{
		id: 1,
		name: "СОКОЛ",
		description: "Классический внедорожник с высокой проходимостью",
		price: 650000,
		images: [
			"/images/sokol-1.jpg",
			"/images/sokol-detail.jpg",
			"/images/sokol-side.jpg"
		],
		specs: {
			size: "3000 × 1950 мм",
			height: "1700 мм",
			engine: "1NZ-FE, бензиновый, четырёхтактный",
			clearance: "400 мм",
			seats: "2 места",
			transmission: "4-ступенчатая АКПП"
		},
		accessories: {
			"Освещение": [
				{
					id: 1,
					name: "Дополнительные фары",
					description: "Увеличивают видимость в темное время суток.",
					price: 15000,
					image: "/images/accessory-lights.jpg"
				},
				{
					id: 2,
					name: "Светодиодная балка (72 Вт)",
					description: "Мощное освещение для экстремальных условий.",
					price: 25000,
					image: "/images/led-bar.jpg"
				}
			],
			"Шины": [
				{
					id: 3,
					name: "Грязевые шины",
					description: "Шины KVAADRO 76 E для бездорожья",
					price: 35000,
					image: "/images/tires-mud.jpg"
				},
				{
					id: 4,
					name: "Шипованные шины",
					description: "Улучшенное сцепление на льду и камнях",
					price: 30000,
					image: "/images/tires-studded.jpg"
				}
			],
			"Дополнительно": [
				{
					id: 5,
					name: "Электрическая лебёдка",
					description: "Для спасения и буксировки",
					price: 20000,
					image: "/images/winches.jpg"
				},
				{
					id: 6,
					name: "Подогрев ручек",
					description: "Обогрев рукояток управления",
					price: 8000,
					image: "/images/heated-handles.jpg"
				},
				{
					id: 7,
					name: "Фаркоп",
					description: "Для прицепа или груза",
					price: 12000,
					image: "/images/trailer-hitch.jpg"
				},
				{
					id: 8,
					name: "Подогрев сиденья",
					description: "Для комфортной езды зимой",
					price: 10000,
					image: "/images/heated-seat.jpg"
				},
				{
					id: 9,
					name: "Расширители арок",
					description: "Защита от грязи и камней",
					price: 15000,
					image: "/images/fender-flares.jpg"
				},
				{
					id: 10,
					name: "Дополнительные канистры",
					description: "Для топлива и инструментов",
					price: 18000,
					image: "/images/canisters.jpg"
				}
			]
		}
	},
	{
		id: 2,
		name: "СОКОЛ-ПИКАП-1.5",
		description: "Мощный пикап для перевозки грузов",
		price: 680000,
		images: [
			"/images/pickup-1_5-1.jpg",
			"/images/pickup-1_5-detail.jpg",
			"/images/pickup-1_5-side.jpg"
		],
		specs: {
			size: "3000 × 1950 мм",
			height: "1700 мм",
			engine: "1NZ-FE, бензиновый, четырёхтактный",
			clearance: "400 мм",
			seats: "2 места",
			transmission: "4-ступенчатая АКПП"
		},
		accessories: {
			"Освещение": [
				{
					id: 11,
					name: "Дополнительные фары",
					description: "Увеличивают видимость в темное время суток.",
					price: 15000,
					image: "/images/accessory-lights.jpg"
				},
				{
					id: 12,
					name: "Светодиодная балка (72 Вт)",
					description: "Мощное освещение для экстремальных условий.",
					price: 25000,
					image: "/images/led-bar.jpg"
				}
			],
			"Шины": [
				{
					id: 13,
					name: "Грязевые шины",
					description: "Шины KVAADRO 76 E для бездорожья",
					price: 35000,
					image: "/images/tires-mud.jpg"
				},
				{
					id: 14,
					name: "Шипованные шины",
					description: "Улучшенное сцепление на льду и камнях",
					price: 30000,
					image: "/images/tires-studded.jpg"
				}
			],
			"Дополнительно": [
				{
					id: 15,
					name: "Электрическая лебёдка",
					description: "Для спасения и буксировки",
					price: 20000,
					image: "/images/winches.jpg"
				},
				{
					id: 16,
					name: "Подогрев ручек",
					description: "Обогрев рукояток управления",
					price: 8000,
					image: "/images/heated-handles.jpg"
				},
				{
					id: 17,
					name: "Фаркоп",
					description: "Для прицепа или груза",
					price: 12000,
					image: "/images/trailer-hitch.jpg"
				},
				{
					id: 18,
					name: "Подогрев сиденья",
					description: "Для комфортной езды зимой",
					price: 10000,
					image: "/images/heated-seat.jpg"
				},
				{
					id: 19,
					name: "Расширители арок",
					description: "Защита от грязи и камней",
					price: 15000,
					image: "/images/fender-flares.jpg"
				},
				{
					id: 20,
					name: "Дополнительные канистры",
					description: "Для топлива и инструментов",
					price: 18000,
					image: "/images/canisters.jpg"
				}
			]
		}
	},
	{
		id: 3,
		name: "СОКОЛ-ПИКАП-1.8",
		description: "Расширенная версия с увеличенным объёмом двигателя",
		price: 700000,
		images: [
			"/images/pickup-1_8-1.jpg",
			"/images/pickup-1_8-detail.jpg",
			"/images/pickup-1_8-side.jpg"
		],
		specs: {
			size: "3000 × 1950 мм",
			height: "1700 мм",
			engine: "1NZ-FE, бензиновый, четырёхтактный",
			clearance: "400 мм",
			seats: "2 места",
			transmission: "4-ступенчатая АКПП"
		},
		accessories: {
			"Освещение": [
				{
					id: 21,
					name: "Дополнительные фары",
					description: "Увеличивают видимость в темное время суток.",
					price: 15000,
					image: "/images/accessory-lights.jpg"
				},
				{
					id: 22,
					name: "Светодиодная балка (72 Вт)",
					description: "Мощное освещение для экстремальных условий.",
					price: 25000,
					image: "/images/led-bar.jpg"
				}
			],
			"Шины": [
				{
					id: 23,
					name: "Грязевые шины",
					description: "Шины KVAADRO 76 E для бездорожья",
					price: 35000,
					image: "/images/tires-mud.jpg"
				},
				{
					id: 24,
					name: "Шипованные шины",
					description: "Улучшенное сцепление на льду и камнях",
					price: 30000,
					image: "/images/tires-studded.jpg"
				}
			],
			"Дополнительно": [
				{
					id: 25,
					name: "Электрическая лебёдка",
					description: "Для спасения и буксировки",
					price: 20000,
					image: "/images/winches.jpg"
				},
				{
					id: 26,
					name: "Подогрев ручек",
					description: "Обогрев рукояток управления",
					price: 8000,
					image: "/images/heated-handles.jpg"
				},
				{
					id: 27,
					name: "Фаркоп",
					description: "Для прицепа или груза",
					price: 12000,
					image: "/images/trailer-hitch.jpg"
				},
				{
					id: 28,
					name: "Подогрев сиденья",
					description: "Для комфортной езды зимой",
					price: 10000,
					image: "/images/heated-seat.jpg"
				},
				{
					id: 29,
					name: "Расширители арок",
					description: "Защита от грязи и камней",
					price: 15000,
					image: "/images/fender-flares.jpg"
				},
				{
					id: 30,
					name: "Дополнительные канистры",
					description: "Для топлива и инструментов",
					price: 18000,
					image: "/images/canisters.jpg"
				}
			]
		}
	},
	{
		id: 4,
		name: "СОКОЛ-ПРО",
		description: "Версия с увеличенным клиренсом и мощностью",
		price: 850000,
		images: [
			"/images/pro-1.jpg",
			"/images/pro-detail.jpg",
			"/images/pro-side.jpg"
		],
		specs: {
			size: "3200 × 2050 мм",
			height: "1700 мм",
			engine: "1ZZ-FE, бензиновый, четырёхтактный",
			clearance: "500 мм",
			seats: "3 места",
			transmission: "4-ступенчатая АКПП"
		},
		accessories: {
			"Освещение": [
				{
					id: 31,
					name: "Дополнительные фары",
					description: "Увеличивают видимость в темное время суток.",
					price: 15000,
					image: "/images/accessory-lights.jpg"
				},
				{
					id: 32,
					name: "Светодиодная балка (72 Вт)",
					description: "Мощное освещение для экстремальных условий.",
					price: 25000,
					image: "/images/led-bar.jpg"
				}
			],
			"Шины": [
				{
					id: 33,
					name: "Автросс X-trime (1200×600×21)",
					description: "Профиль для тяжелых условий",
					price: 45000,
					image: "/images/tire-autross.jpg"
				},
				{
					id: 34,
					name: "Трекол (1300×700×21)",
					description: "Максимальное сцепление с грунтом",
					price: 50000,
					image: "/images/tire-trekol.jpg"
				}
			],
			"Дополнительно": [
				{
					id: 35,
					name: "Электрическая лебёдка",
					description: "Для спасения и буксировки",
					price: 20000,
					image: "/images/winches.jpg"
				},
				{
					id: 36,
					name: "Жестко заблокированный дифференциал",
					description: "Для максимального сцепления",
					price: 25000,
					image: "/images/diff-lock.jpg"
				},
				{
					id: 37,
					name: "Подогрев сиденья",
					description: "Для комфортной езды зимой",
					price: 10000,
					image: "/images/heated-seat.jpg"
				},
				{
					id: 38,
					name: "Расширители арок",
					description: "Защита от грязи и камней",
					price: 15000,
					image: "/images/fender-flares.jpg"
				},
				{
					id: 39,
					name: "Фаркоп",
					description: "Для прицепа или груза",
					price: 12000,
					image: "/images/trailer-hitch.jpg"
				},
				{
					id: 40,
					name: "Дополнительные канистры",
					description: "Для топлива и инструментов",
					price: 18000,
					image: "/images/canisters.jpg"
				}
			]
		}
	}
];