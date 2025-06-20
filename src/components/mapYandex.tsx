import React from 'react';

const DynamicYandexMap = () => {
  return (
    <section className="bg-neutral-800 text-gray-200 py-4">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
          Как нас найти
        </h2>

        {/* Карта по центру с адаптивным соотношением сторон */}
        <div className="mx-auto rounded-xl overflow-hidden shadow-2xl bg-neutral-900 border border-neutral-700">
          <div className="h-100">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A254de833350520bd7e4f5e1bfc20d3607f3b01fac102f13db1df68fc1696db89&amp;source=constructor"
              frameBorder="0"
              allowFullScreen
              title="Карта компании Якт-Сокол"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* Контакты */}
        <div className="mt-10 max-w-md mx-auto text-center">
          <p className="text-gray-300 text-lg">г. Якутск, ул. Чусовского, 75/3</p>
          <p className="text-gray-300 text-lg mt-2">
            📞 Телефон: <a href="tel:+79969141414" className="text-green-400 hover:text-green-300 transition underline">+7 (996) 914 14 14</a>
          </p>
          <p className="text-gray-400 text-sm mt-1">Работаем ежедневно с 9:00 до 18:00</p>
        </div>
      </div>
    </section>
  );
};

export default DynamicYandexMap;