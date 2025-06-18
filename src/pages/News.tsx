import { newsItems } from '../data/news';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function News() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <section className="py-16 bg-neutral-800 mt-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-center text-white">Новости компании</h1>
          <p className="text-center max-w-2xl mx-auto text-gray-400">
            Следите за нашими новостями и акциями.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
						{/* Цикл с новостями */}
            {newsItems.map((item, index) => (
              <article
                key={index}
                className="bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-neutral-700 transition-transform duration-300 hover:scale-105 hover:border-neutral-600"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
                  <time className="text-sm text-gray-400 block mb-3">{item.date}</time>
                  <p className="text-gray-300 mb-4 line-clamp-3">{item.content}</p>
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
      </section>

      <Footer />
    </div>
  );
}