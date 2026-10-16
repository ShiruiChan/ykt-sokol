import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendRequest, RequestValidationError, type RequestAccessory } from '../utils/request';
import { PHONE } from '../config/site';
import { reachGoal } from './Metrika';
import { ArrowUpRight, Check } from './Icons';

/** Данные сметы со страницы модели — уходят вместе с контактом */
export interface RequestOrder {
	model: string;
	price: number;
	accessories: RequestAccessory[];
	total: number;
}

interface ContactFormProps {
	/** Что именно интересует клиента — уходит в заявку */
	subject?: string;
	/** Смета со страницы модели */
	order?: RequestOrder;
	/** Подпись над полями */
	note?: string;
	/**
	 * modal — компактная колонка для модалки;
	 * page — карточка на странице модели, имя и телефон в две колонки на sm+
	 */
	variant?: 'modal' | 'page';
	/** Старый флаг компактного вида, равен variant="modal" */
	compact?: boolean;
	className?: string;
	onSent?: () => void;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

const PHONE_RE = /^[+()\d\s-]{10,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY = { name: '', contact: '', comments: '', website: '' };

export default function ContactForm({
	subject = 'Заявка с сайта',
	order,
	note,
	variant,
	compact = false,
	className = '',
	onSent,
}: ContactFormProps) {
	const isPage = variant === 'page';
	const isCompact = !isPage && (compact || variant === 'modal');

	// useId: форма может оказаться на странице дважды (страница модели + модалка)
	const uid = useId();
	const id = (field: string) => `${uid}-${field}`;

	const [values, setValues] = useState(EMPTY);
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
		const name = values.name.trim();
		if (name.length < 2) next.name = 'Укажите, как к вам обращаться';
		else if (name.length > 100) next.name = 'Слишком длинно — хватит имени';
		const contact = values.contact.trim();
		if (!contact) next.contact = 'Нужен телефон или почта для ответа';
		else if (!PHONE_RE.test(contact) && !EMAIL_RE.test(contact))
			next.contact = 'Похоже на опечатку — проверьте номер или адрес';
		if (values.comments.length > 2000) next.comments = 'Комментарий длиннее 2000 символов';
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (status === 'sending' || !validate()) return;

		setStatus('sending');
		try {
			const channel = await sendRequest({
				name: values.name.trim(),
				contact: values.contact.trim(),
				comment: values.comments.trim(),
				subject: order ? undefined : subject,
				...(order ?? {}),
				website: values.website,
			});
			setStatus('sent');
			setValues(EMPTY);
			reachGoal('request_sent', { subject: order?.model ?? subject, channel });
			onSent?.();
		} catch (err) {
			if (err instanceof RequestValidationError) {
				// Сервер строже клиента только в краевых случаях — подсветим поля
				const next: Record<string, string> = {};
				if (err.errors.name) next.name = 'Проверьте имя';
				if (err.errors.contact) next.contact = 'Проверьте телефон или почту';
				if (err.errors.comment) next.comments = 'Комментарий слишком длинный';
				setErrors(next);
			}
			setStatus('error');
			reachGoal('request_error', {
				subject: order?.model ?? subject,
				reason: err instanceof RequestValidationError ? 'validation' : 'delivery',
			});
		}
	};

	if (status === 'sent') {
		return (
			<div
				role="status"
				className={`animate-fadeIn rounded-lg border border-accent-500/30 bg-accent-900/40 p-8 ${
					isPage ? '' : 'text-center'
				} ${className}`}
			>
				<div
					className={`mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-500 text-white ${
						isPage ? '' : 'mx-auto'
					}`}
				>
					<Check className="h-6 w-6" />
				</div>
				<p className="text-lg font-semibold text-fog-50">Заявка принята</p>
				<p className="mt-2 text-sm text-fog-400">
					Перезвоним в рабочее время — с 9:00 до 18:00 по Якутску.
				</p>
				<button type="button" onClick={() => setStatus('idle')} className="link-quiet mt-6">
					Отправить ещё одну
				</button>
			</div>
		);
	}

	const errorText = (field: string) =>
		errors[field] && (
			<p id={id(`${field}-err`)} className="mt-2 text-sm text-[#e08d76]">
				{errors[field]}
			</p>
		);

	const nameField = (
		<div>
			<label htmlFor={id('name')} className="field-label">
				Как к вам обращаться
			</label>
			<input
				id={id('name')}
				name="from_name"
				type="text"
				autoComplete="name"
				placeholder="Айсен Николаев"
				maxLength={100}
				className="field"
				value={values.name}
				onChange={update('name')}
				aria-invalid={Boolean(errors.name)}
				aria-describedby={errors.name ? id('name-err') : undefined}
			/>
			{errorText('name')}
		</div>
	);

	const contactField = (
		<div>
			<label htmlFor={id('contact')} className="field-label">
				Телефон или почта
			</label>
			<input
				id={id('contact')}
				name="contact"
				type="text"
				inputMode="tel"
				autoComplete="tel"
				placeholder="+7 (914) 276-75-20"
				maxLength={100}
				className="field tnum"
				value={values.contact}
				onChange={update('contact')}
				aria-invalid={Boolean(errors.contact)}
				aria-describedby={errors.contact ? id('contact-err') : undefined}
			/>
			{errorText('contact')}
		</div>
	);

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			className={`${isCompact ? 'space-y-5' : 'space-y-6'} ${
				isPage ? 'rounded-lg border border-white/8 bg-ink-850 p-6 md:p-8' : ''
			} ${className}`}
		>
			{note && <p className="text-sm text-fog-400">{note}</p>}

			{isPage ? (
				<div className="grid gap-5 sm:grid-cols-2">
					{nameField}
					{contactField}
				</div>
			) : (
				<>
					{nameField}
					{contactField}
				</>
			)}

			<div>
				<label htmlFor={id('comments')} className="field-label">
					Комментарий
					<span className="ml-2 font-normal tracking-normal text-fog-500">необязательно</span>
				</label>
				<textarea
					id={id('comments')}
					name="comments"
					rows={isCompact ? 3 : 4}
					maxLength={2000}
					placeholder={
						order
							? 'Сроки, доставка, дополнительные пожелания'
							: 'Какая модель интересует, сроки, комплектация'
					}
					className="field resize-none"
					value={values.comments}
					onChange={update('comments')}
					aria-invalid={Boolean(errors.comments)}
					aria-describedby={errors.comments ? id('comments-err') : undefined}
				/>
				{errorText('comments')}
			</div>

			{/* Ловушка для ботов: людям не видна и недоступна с клавиатуры */}
			<div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
				<label htmlFor={id('website')}>Сайт</label>
				<input
					id={id('website')}
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
					value={values.website}
					onChange={update('website')}
				/>
			</div>

			{status === 'error' && (
				<p
					role="alert"
					className="rounded-sm border border-[#a8543f]/50 bg-[#2a1512] px-4 py-3 text-sm text-[#e5a894]"
				>
					Не удалось отправить заявку. Попробуйте ещё раз или позвоните:{' '}
					<a href={PHONE.href} className="tnum underline">
						{PHONE.label}
					</a>
				</p>
			)}

			<button
				type="submit"
				className={`btn btn-primary w-full ${isPage ? 'sm:w-auto' : ''}`}
				disabled={status === 'sending'}
			>
				{status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
				<span className="btn-dot">
					<ArrowUpRight className="h-4 w-4" />
				</span>
			</button>

			<p className={`text-xs leading-relaxed text-fog-500 ${isPage ? '' : 'text-center'}`}>
				Нажимая кнопку, вы соглашаетесь на обработку персональных данных на условиях{' '}
				{/* В новой вкладке — чтобы не потерять заполненные поля */}
				<Link
					to="/privacy"
					target="_blank"
					rel="noopener"
					className="underline decoration-fog-500/50 underline-offset-2 transition-colors hover:text-fog-200"
				>
					политики конфиденциальности
				</Link>
				.
			</p>
		</form>
	);
}
