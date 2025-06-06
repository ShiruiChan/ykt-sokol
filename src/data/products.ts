// src/data/products.ts
import type { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: "X-100",
    description: "Высокая проходимость и надежность",
    price: "от 450 000 ₽",
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
    accessories: [
      {
        name: "Дополнительные фары",
        description: "Повышают видимость в темное время суток.",
        price: "20 000 ₽",
        image: "/images/accessory-lights.jpg"
      }
    ]
  },
  {
    id: 2,
    name: "X-200",
    description: "Для охотников и путешествий",
    price: "от 520 000 ₽",
    images: [
      "/images/quad-2.jpg",
      "/images/quad-2-detail.jpg",
      "/images/quad-2	-side.jpg"
    ],
    specs: {
      size: "3x2 м",
      height: "2.2 м",
      engine: "Yamaha R1000"
    },
    accessories: []
  }
];