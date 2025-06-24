import React, { useState } from 'react';

interface GalleryCardProps {
  image: {
    id: string;
    url: string;
    title: string;
    description?: string;
  };
}

export default function GalleryCard({ image }: GalleryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <article className="bg-neutral-800 rounded-xl overflow-hidden border-2 border-neutral-700 hover:scale-3d hover:border-green-400">
        <img
          src={image.url}
          alt={image.title}
          loading="lazy"
          decoding="async"
          className="w-full h-48 sm:h-64 object-cover cursor-pointer"
          // onClick={() => setIsModalOpen(true)}
          srcSet={`${image.url} 1x, ${image.url.replace(/\.\w+$/, '@2x$&')} 2x`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </article>

      {/* Модальное окно */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-[90vw] max-h-[85vh] w-auto h-auto flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.url}
              alt={image.title}
              className="max-w-[95vw] max-h-[50vh] object-contain rounded-lg shadow-xl border-green-400 border-2"
            />
            <button
              aria-label="Закрыть"
              className="absolute top-4 right-4 text-white bg-black/60 hover:bg-black/80 rounded-full w-10 h-10 flex items-center justify-center transition"
              onClick={() => setIsModalOpen(false)}
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}