// src/components/ImageGallery.tsx
import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full">
      {/* Текущее изображение */}
      <img
        src={images[currentIndex]}
        alt={`Квадрацикл ${currentIndex + 1}`}
        className="w-full h-auto rounded"
      />

      {/* Стрелки навигации */}
      <button
        onClick={prev}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
        aria-label="Предыдущее изображение"
      >
        ←
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
        aria-label="Следующее изображение"
      >
        →
      </button>

      {/* Индикатор слайдов */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? 'bg-orange-500' : 'bg-gray-400'
            }`}
            aria-label={`Перейти к изображению ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}