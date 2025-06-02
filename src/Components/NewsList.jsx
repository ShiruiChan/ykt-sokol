const newsItems = [
	{
		title: "Новая серия квадроциклов готова к запуску",
		date: "25 мая 2025",
		image: "/images/news1.jpg"
	},
	{
		title: "Увеличение объема производства",
		date: "10 мая 2025",
		image: "/images/news2.jpg"
	},
	{
		title: "Участие в выставке внедорожной техники",
		date: "5 мая 2025",
		image: "/images/news3.jpg"
	}
];

const NewsList = () => {
	return (
		<section className="py-12">
			<div className="container mx-auto">
				<h2 className="text-3xl font-bold mb-8 text-center">Новости компании</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{newsItems.map((item, index) => (
						<div key={index} className="bg-white shadow-md rounded overflow-hidden">
							<img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
							<div className="p-4">
								<h3 className="text-xl font-semibold">{item.title}</h3>
								<p className="text-gray-500">{item.date}</p>
								<a href="#" className="text-orange-500 hover:underline mt-2 inline-block">Читать далее →</a>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default NewsList;