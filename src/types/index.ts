export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
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
	id: number;
	title: string;
	date: string;
	image: string;
	content: string;
};