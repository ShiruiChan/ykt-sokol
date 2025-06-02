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
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setSubmitted(true);
				setFormData({ name: '', contact: '', message: '' });
				setError('');
			}
		} catch (err) {
			setError('Ошибка при отправке');
		}
	};

	if (submitted) {
		return (
			<div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
				<p>Спасибо! Мы свяжемся с вами.</p>
				<button onClick={() => setSubmitted(false)} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
					Написать еще
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="mb-8">
			<h2 className="text-xl font-semibold mb-4">Свяжитесь с нами</h2>
			{error && <p className="text-red-500 mb-4">{error}</p>}
			<div className="mb-4">
				<label className="block text-gray-700 mb-2" htmlFor="name">Имя</label>
				<input
					type="text"
					id="name"
					name="name"
					value={formData.name}
					onChange={handleChange}
					className="w-full px-4 py-2 border rounded"
				/>
			</div>
			<div className="mb-4">
				<label className="block text-gray-700 mb-2" htmlFor="contact">Email или телефон</label>
				<input
					type="text"
					id="contact"
					name="contact"
					value={formData.contact}
					onChange={handleChange}
					className="w-full px-4 py-2 border rounded"
				/>
			</div>
			<div className="mb-4">
				<label className="block text-gray-700 mb-2" htmlFor="message">Сообщение</label>
				<textarea
					id="message"
					name="message"
					value={formData.message}
					onChange={handleChange}
					rows={4}
					className="w-full px-4 py-2 border rounded"
				></textarea>
			</div>
			<button
				type="submit"
				className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
			>
				Отправить
			</button>
		</form>
	);
}