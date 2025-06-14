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
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
        <p>Спасибо! Мы свяжемся с вами в ближайшее время.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 bg-gray-500 text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-400 transition-colors"
        >
          Написать ещё
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input
        type="text"
        name="name"
        placeholder="Ваше имя"
        value={formData.name}
        onChange={handleChange}
        className="w-full px-4 py-3 mb-4 border border-gray-600 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-400"
      />
      <input
        type="text"
        name="contact"
        placeholder="Email или телефон"
        value={formData.contact}
        onChange={handleChange}
        className="w-full px-4 py-3 mb-4 border border-gray-600 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-400"
      />
      <textarea
        name="message"
        rows={4}
        placeholder="Ваше сообщение"
        value={formData.message}
        onChange={handleChange}
        className="w-full px-4 py-3 mb-4 border border-gray-600 rounded bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-400"
      ></textarea>
      <button type="submit" className="bg-gray-500 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-400 transition-colors">Отправить</button>
    </form>
  );
}