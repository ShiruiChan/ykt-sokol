import { newsList } from '../data/news';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function News() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />

			<section className="py-12 md:pb-16 md:pt-24 bg-neutral-900 text-white">
				<div className="container mx-auto px-4">
					<h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">Новости компании</h1>
					<p className="text-center max-w-2xl mx-auto text-gray-400">
						Следите за нашими новостями и акциями.
					</p>

					{/* Секция закреплённых новостей */}
					{newsList.some((item) => item.isPinned) && (
						<div className="mt-12">
							<h2 className="text-2xl font-semibold mb-6">Закреплённые новости</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{newsList
									.filter((item) => item.isPinned)
									.map((item) => (
										<article
											key={item.id}
											className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-neutral-700 transition-transform duration-300 hover:scale-105 hover:border-blue-500"
										>
											<img
												src={item.image}
												alt={item.title}
												className="w-full h-48 object-cover"
											/>
											<div className="p-6">
												{item.tags && (
													<div className="flex flex-wrap gap-2 mb-3">
														{item.tags.map((tag, idx) => (
															<span
																key={idx}
																className="text-xs font-medium px-2 py-1 bg-blue-600 text-white rounded-full"
															>
																{tag}
															</span>
														))}
													</div>
												)}
												<h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
												<time className="text-sm text-gray-400 block mb-3">
													{new Date(item.date).toLocaleDateString('ru-RU', {
														day: 'numeric',
														month: 'long',
														year: 'numeric',
													})}
												</time>
												<p className="text-gray-300 mb-4 line-clamp-3">
													{item.summary || item.content.substring(0, 150)}...
												</p>
												<a
													href="#"
													className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
												>
													Читать далее
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="16"
														height="16"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="ml-1"
													>
														<path d="M5 12h14M12 5l7 7-7 7" />
													</svg>
												</a>
											</div>
										</article>
									))}
							</div>
						</div>
					)}

					{/* Все остальные новости */}
					<div className="mt-12">
						<h2 className="text-2xl font-semibold mb-6">Все новости</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
							{newsList
								.filter((item) => !item.isPinned)
								.map((item) => (
									<article
										key={item.id}
										className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-neutral-700 transition-transform duration-300 hover:scale-105 hover:border-neutral-600"
									>
										<img
											src={item.image}
											alt={item.title}
											className="w-full h-48 object-cover"
										/>
										<div className="p-6">
											{item.tags && (
												<div className="flex flex-wrap gap-2 mb-3">
													{item.tags.map((tag, idx) => (
														<span
															key={idx}
															className="text-xs font-medium px-2 py-1 bg-gray-700 text-gray-200 rounded-full"
														>
															{tag}
														</span>
													))}
												</div>
											)}
											<h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
											<time className="text-sm text-gray-400 block mb-3">
												{new Date(item.date).toLocaleDateString('ru-RU', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
												})}
											</time>
											<p className="text-gray-300 mb-4 line-clamp-3">
												{item.summary || item.content.substring(0, 150)}...
											</p>
											<a
												href="#"
												className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
											>
												Читать далее
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="16"
													height="16"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
													strokeLinejoin="round"
													className="ml-1"
												>
													<path d="M5 12h14M12 5l7 7-7 7" />
												</svg>
											</a>
										</div>
									</article>
								))}
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}