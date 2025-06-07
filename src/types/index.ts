export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  images: string[];
  specs: {
    size: string;
    height: string;
    engine?: string;
  };
  accessories: Array<{
    name: string;
    description: string;
    price: string;
    image: string;
  }>;
};

export type NewsItem = {
  title: string;
  content: string;
  image?: string;
  date?: string;
};