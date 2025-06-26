import React, { useState } from 'react';

interface Document {
  id: string;
  url: string;
  title: string;
  description?: string;
}

interface DocumentCardProps {
  document: Document;
  loading?: 'lazy' | 'eager'; // Add loading prop for TypeScript safety
}

export default function DocumentCard({ document, loading = 'lazy' }: DocumentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <article
        className="bg-neutral-800 rounded-xl overflow-hidden border-2 border-neutral-700 hover:border-green-400 transition-all duration-200 hover:scale-[1.02]"
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)} // Keyboard accessibility
      >
        <div className="p-4 flex flex-col items-center">
          {/* PDF Icon */}
          <svg
            className="w-16 h-16 text-red-500 mb-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM9 12c0-.55.45-1 1-1h1v2h-1c-.55 0-1-.45-1-1zm4 5c0 .55-.45 1-1 1h-1v-2h1c.55 0 1 .45 1 1zm-2-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-white text-center">{document.title}</h3>
          {document.description && (
            <p className="text-gray-400 text-sm mt-2 text-center">{document.description}</p>
          )}
          <a
            href={document.url}
            download
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={(e) => e.stopPropagation()} // Prevent modal opening on download click
          >
            Скачать
          </a>
        </div>
      </article>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${document.id}-title`}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] w-auto h-auto flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={document.url}
              title={document.title}
              className="max-w-full max-h-[85vh] w-[90vw] h-[85vh] rounded-lg shadow-xl border-green-400 restorative"
              loading="lazy"
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