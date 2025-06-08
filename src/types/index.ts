export type Product = {
  id: number;
  name: string;
  description: string;
  price: number; // важно: число, а не строка!
  images: string[];
  specs: {
    size: string;
    height: string;
    engine?: string;
  };
  accessories: Record<string, Accessory[]>; // объект с категориями
};

export type Accessory = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
};

export type NewsItem = {
  title: string;
  content: string;
  image?: string;
  date?: string;
};