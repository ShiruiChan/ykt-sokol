import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GalleryCard from '../components/GalleryCard';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [visibleCount, setVisibleCount] = useState(9); // Initially show 10 images
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    // Simulate fetching images
    const start = 1;
    const end = 65; // Total images available
    const extensions = ['avif'];

    const loadedImages: GalleryImage[] = [];

    for (let i = start; i <= end; i++) {
      for (const ext of extensions) {
        const fileName = `1 (${i}).${ext}`;
        const filePath = `/gallery/${fileName}`;

        loadedImages.push({
          id: `img-${i}`,
          url: filePath,
          title: `Фото ${i}`,
          description: `Описание для изображения ${i}`,
        });
        break; // Stop at the first extension
      }
    }

    // Simulate network delay
    setTimeout(() => {
      setImages(loadedImages);
      setLoading(false);
    }, 500);
  }, []);

  // Memoize the visible images slice to prevent unnecessary re-computation
  const visibleImages = useMemo(() => images.slice(0, visibleCount), [images, visibleCount]);

  // Handle "Show More" button click
  const handleShowMore = () => {
    setIsLoadingMore(true);
    // Simulate a small delay for loading more images
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 9, images.length));
      setIsLoadingMore(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="text-center py-8 pt-[40vh]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-400">Загрузка изображений...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white pt-20 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-transparent pointer-events-none"></div>
      <Header />
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">Галерея</h1>

      <section className="py-12 md:pb-16 md:pt-24">
        <div className="container mx-auto px-4">
          <p className="text-center max-w-2xl mx-auto text-gray-400">
            Просмотрите наши фотографии.
          </p>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {visibleImages.length > 0 ? (
              visibleImages.map((img) => (
                <GalleryCard key={img.id} image={img} loading="lazy" />
              ))
            ) : (
              <p className="text-gray-400 col-span-full text-center py-8">
                Изображений пока нет.
              </p>
            )}
          </div>

          {/* Show More Button */}
          {visibleCount < images.length && (
            <div className="text-center mt-8">
              <button
                onClick={handleShowMore}
                disabled={isLoadingMore}
                className={`px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition ${
                  isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoadingMore ? 'Загрузка...' : 'Показать ещё'}
              </button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}