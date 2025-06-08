import type { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: "X-100",
    description: "Высокая проходимость и надежность",
    price: 450000,
    images: [
      "/images/quad-1.jpg",
      "/images/quad-1-detail.jpg",
      "/images/quad-1-side.jpg"
    ],
    specs: {
      size: "3x2 м",
      height: "2.1 м",
      engine: "Honda GX690"
    },
    accessories: {
      "Освещение": [
        {
          id: 1,
          name: "Дополнительные фары",
          description: "Повышают видимость в темное время суток.",
          price: 20000,
          image: "/images/accessory-lights.jpg"
        }
      ],
      "Шины": [
        {
          id: 2,
          name: "Грязевые шины",
          description: "Увеличенный протектор для бездорожья",
          price: 35000,
          image: "/images/tires-mud.jpg"
        },
				{
          id: 3,
          name: "Шипованные шины",
          description: "Шипы для цвеличения сцепления",
          price: 30000,
          image: "/images/tires-mud.jpg"
        }
      ],
			"Дополнения": [
        {
          id: 4,
          name: "Крепление для ружья",
          description: "Для фиксации ружья",
          price: 5000,
          image: "/images/accessory-lights.jpg"
        },
				{
          id: 5,
          name: "Лебёдка",
          description: "Лебёдка",
          price: 15000,
          image: "/images/accessory-lights.jpg"
        },
				{
          id: 6,
          name: "Подогрев сидений",
          description: "Чтобы при зимней погоде было тепло",
          price: 15000,
          image: "/images/accessory-lights.jpg"
        }
      ],
    }
  },
  {
    id: 2,
    name: "X-200",
    description: "Для охотников и путешествий",
    price: 520000,
    images: [
      "/images/quad-2.jpg",
      "/images/quad-2-detail.jpg",
      "/images/quad-2-side.jpg"
    ],
    specs: {
      size: "3x2 м",
      height: "2.2 м",
      engine: "Yamaha R1000"
    },
    accessories: {}
  }
];