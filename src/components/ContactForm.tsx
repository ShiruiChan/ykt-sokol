import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      setError('Все поля обязательны');
      return;
    }

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setSubmitted(true);
      setFormData({ name: '', contact: '', message: '' });
      setError('');
    } catch (err) {
      setError('Ошибка при отправке формы');
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-6 mb-6 rounded-lg shadow-md animate-fadeIn">
        <p className="text-lg">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 inline-block bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-full font-semibold transition-colors duration-300"
        >
          Написать ещё
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-gray-300 mb-2 font-medium">Ваше имя</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Иван Иванов"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-600 bg-zinc-300 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      <div>
        <label htmlFor="contact" className="block text-gray-300 mb-2 font-medium">Email или телефон</label>
        <input
          type="text"
          id="contact"
          name="contact"
          placeholder="example@email.com или +7 (999) 999-99-99"
          value={formData.contact}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-600 bg-zinc-300 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-gray-300 mb-2 font-medium">Ваше сообщение</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Напишите ваш вопрос или предложение..."
          value={formData.message}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-600 bg-zinc-300 text-gray-200 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
        ></textarea>
      </div>

      <div className="flex justify-center mt-4">
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-500 border-b-4 border-green-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg hover:from-green-500 hover:to-emerald-400 transform hover:-translate-y-0.5 transition-all duration-300"
        >
          Отправить
        </button>
      </div>
    </form>
  );
}