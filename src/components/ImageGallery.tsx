import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

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

	const handlers = useSwipeable({
		onSwipedLeft: next,
		onSwipedRight: prev,
	});

  return (
    <div className="relative w-full" {...handlers}>
      <img
        src={images[currentIndex]}
        alt={`Квадрацикл ${currentIndex + 1}`}
        className="w-full h-auto rounded-lg"
      />

      <button
        onClick={prev}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-gray-200 p-2 rounded-full z-10 hover:bg-gray-700 transition"
        aria-label="Предыдущее изображение"
      >
        ←
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-gray-200 p-2 rounded-full z-10 hover:bg-gray-700 transition"
        aria-label="Следующее изображение"
      >
        →
      </button>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? 'bg-gray-300' : 'bg-gray-600'
            } hover:bg-gray-400 transition`}
            aria-label={`Перейти к изображению ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}