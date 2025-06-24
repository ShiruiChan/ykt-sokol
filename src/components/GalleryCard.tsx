import React, { useState } from 'react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface GalleryCardProps {
  image: GalleryImage;
  loading?: 'lazy' | 'eager'; // Add loading prop for TypeScript safety
}

export default function GalleryCard({ image, loading = 'lazy' }: GalleryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate srcSet dynamically (assuming @2x images exist; adjust as needed)
  const srcSet = `${image.url} 1x, ${image.url.replace(/(\.\w+)$/, '@2x$1')} 2x`;

  return (
    <>
      <article
        className="bg-neutral-800 rounded-xl overflow-hidden border-2 border-neutral-700 hover:border-green-400 transition-all duration-200 hover:scale-[1.02]"
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)} // Keyboard accessibility
      >
        <img
          src={image.url}
          alt={image.title}
          loading={loading}
          decoding="async"
          className="w-full h-48 sm:h-64 object-cover cursor-pointer"
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </article>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${image.id}-title`}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.url}
              alt={image.title}
              loading="eager" // Load modal image immediately
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-xl border-green-400 border-2"
            />
            <button
              aria-label="Закрыть модальное окно"
              className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition"
              onClick={() => setIsModalOpen(false)}
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}