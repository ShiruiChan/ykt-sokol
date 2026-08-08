import { useState, type FormEvent } from 'react';
import { sendRequest } from '../utils/emailjs';
import { ArrowUpRight, Check } from './Icons';

interface ContactFormProps {
	/** Что именно интересует клиента — уходит в письмо */
	subject?: string;
	/** Подпись под заголовком формы */
	note?: string;
	/** Компактный вид для модального окна */
	compact?: boolean;
	onSent?: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const PHONE_RE = /^[+()\d\s-]{10,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ContactForm({
	subject = 'Заявка с сайта',
	note,
	compact = false,
	onSent,
}: ContactFormProps) {
	const [values, setValues] = useState({ name: '', contact: '', comments: '' });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [status, setStatus] = useState<Status>('idle');

	const update = (field: keyof typeof values) => (e: { target: { value: string } }) => {
		setValues((v) => ({ ...v, [field]: e.target.value }));
		setErrors((prev) => {
			if (!prev[field]) return prev;
			const next = { ...prev };
			delete next[field];
			return next;
		});
	};

	const validate = () => {
		const next: Record<string, string> = {};
		if (values.name.trim().length < 2) next.name = 'Укажите, как к вам обращаться';
		const contact = values.contact.trim();
		if (!contact) next.contact = 'Нужен телефон или почта для ответа';
		else if (!PHONE_RE.test(contact) && !EMAIL_RE.test(contact))
			next.contact = 'Похоже на опечатку — проверьте номер или адрес';
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		setStatus('sending');
		try {
			await sendRequest({
				from_name: values.name.trim(),
				contact: values.contact.trim(),
				comments: values.comments.trim() || '—',
				product_name: subject,
				product_price: '—',
				accessories: 'Нет выбранных аксессуаров',
				total_price: '—',
			});
			setStatus('sent');
			setValues({ name: '', contact: '', comments: '' });
			onSent?.();
		} catch {
			setStatus('error');
		}
	};

	if (status === 'sent') {
		return (
			<div className="animate-fadeIn rounded-lg border border-accent-500/30 bg-accent-900/40 p-8 text-center">
				<div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-500 text-white">
					<Check className="h-6 w-6" />
				</div>
				<p className="text-lg font-semibold text-fog-50">Заявка принята</p>
				<p className="mt-2 text-sm text-fog-400">
					Перезвоним в рабочее время — с 9:00 до 18:00 по Якутску.
				</p>
				<button
					type="button"
					onClick={() => setStatus('idle')}
					className="link-quiet mt-6"
				>
					Отправить ещё одну
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} noValidate className={compact ? 'space-y-5' : 'space-y-6'}>
			{note && <p className="text-sm text-fog-400">{note}</p>}

			<div>
				<label htmlFor="cf-name" className="field-label">
					Как к вам обращаться
				</label>
				<input
					id="cf-name"
					name="from_name"
					type="text"
					autoComplete="name"
					placeholder="Айсен Николаев"
					className="field"
					value={values.name}
					onChange={update('name')}
					aria-invalid={Boolean(errors.name)}
					aria-describedby={errors.name ? 'cf-name-err' : undefined}
				/>
				{errors.name && (
					<p id="cf-name-err" className="mt-2 text-sm text-[#e08d76]">
						{errors.name}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="cf-contact" className="field-label">
					Телефон или почта
				</label>
				<input
					id="cf-contact"
					name="contact"
					type="text"
					inputMode="tel"
					autoComplete="tel"
					placeholder="+7 (914) 276-75-20"
					className="field tnum"
					value={values.contact}
					onChange={update('contact')}
					aria-invalid={Boolean(errors.contact)}
					aria-describedby={errors.contact ? 'cf-contact-err' : undefined}
				/>
				{errors.contact && (
					<p id="cf-contact-err" className="mt-2 text-sm text-[#e08d76]">
						{errors.contact}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="cf-comments" className="field-label">
					Комментарий
					<span className="ml-2 font-normal tracking-normal text-fog-500">
						необязательно
					</span>
				</label>
				<textarea
					id="cf-comments"
					name="comments"
					rows={compact ? 3 : 4}
					placeholder="Какая модель интересует, сроки, комплектация"
					className="field resize-none"
					value={values.comments}
					onChange={update('comments')}
				/>
			</div>

			{status === 'error' && (
				<p className="rounded-sm border border-[#a8543f]/50 bg-[#2a1512] px-4 py-3 text-sm text-[#e5a894]">
					Не удалось отправить заявку. Попробуйте ещё раз или позвоните:{' '}
					<a href="tel:+79969141414" className="underline">
						+7 (996) 914-14-14
					</a>
				</p>
			)}

			<button type="submit" className="btn btn-primary w-full" disabled={status === 'sending'}>
				{status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
				<span className="btn-dot">
					<ArrowUpRight className="h-4 w-4" />
				</span>
			</button>

			<p className="text-center text-xs leading-relaxed text-fog-500">
				Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
			</p>
		</form>
	);
}
