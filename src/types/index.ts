export type Product = {
	id: number;
	name: string;
	description: string;
	price: string;
	image: string;
	specs: {
		engine: string;
		weight: string;
		capacity: string;
	};
	accessories: Array<{
		name: string;
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