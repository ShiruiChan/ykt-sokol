/** Мелкие элементы интерфейса админки: поля, диалог подтверждения, кнопки порядка */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { uploadFile, UploadError } from './upload';

/* --------------------------------- Поля ---------------------------------- */

interface FieldProps {
	label: string;
	value: string;
	onChange: (v: string) => void;
	hint?: string;
	error?: string;
	placeholder?: string;
	multiline?: boolean;
	rows?: number;
	className?: string;
	inputMode?: 'text' | 'numeric' | 'tel' | 'url';
	type?: string;
}

export function Field({ label, value, onChange, hint, error, placeholder, multiline, rows = 3, className, inputMode, type }: FieldProps) {
	const id = useId();
	const common = {
		id,
		className: 'adm-input',
		value,
		placeholder,
		'aria-invalid': error ? true : undefined,
		'aria-describedby': error || hint ? `${id}-d` : undefined,
	} as const;
	return (
		<div className={className}>
			<label htmlFor={id} className="adm-label">
				{label}
			</label>
			{multiline ? (
				<textarea {...common} rows={rows} onChange={(e) => onChange(e.target.value)} />
			) : (
				<input {...common} type={type ?? 'text'} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} />
			)}
			{error ? (
				<p id={`${id}-d`} className="adm-error-text">
					{error}
				</p>
			) : hint ? (
				<p id={`${id}-d`} className="adm-hint">
					{hint}
				</p>
			) : null}
		</div>
	);
}

/** Цена в рублях: принимает «1 660 000», хранит число. Неверный ввод — подсветка, число не меняется */
export function PriceField({
	label,
	value,
	onChange,
	error,
	className,
}: {
	label: string;
	value: number;
	onChange: (v: number) => void;
	error?: string;
	className?: string;
}) {
	const [text, setText] = useState(() => format(value));
	const [bad, setBad] = useState(false);
	useEffect(() => {
		// Значение сменили снаружи (другая модель) — показываем его
		if (!bad && parse(text) !== value) setText(format(value));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);
	return (
		<Field
			label={label}
			value={text}
			inputMode="numeric"
			className={className}
			error={bad ? 'Только цифры, например 1 660 000' : error}
			onChange={(v) => {
				setText(v);
				const n = parse(v);
				if (n === null) setBad(true);
				else {
					setBad(false);
					onChange(n);
				}
			}}
		/>
	);
}

function format(n: number) {
	return Number.isFinite(n) ? n.toLocaleString('ru-RU') : '';
}

function parse(v: string): number | null {
	const digits = v.replace(/[\s  ₽]/g, '');
	if (!/^\d{1,10}$/.test(digits)) return null;
	return Number(digits);
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
	return (
		<label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fog-200">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="h-4 w-4 accent-[var(--color-accent-500)]"
			/>
			{label}
		</label>
	);
}

/* ---------------------------- Порядок в списке --------------------------- */

export function move<T>(list: T[], from: number, to: number): T[] {
	if (to < 0 || to >= list.length) return list;
	const next = list.slice();
	const [item] = next.splice(from, 1);
	next.splice(to, 0, item);
	return next;
}

export function OrderButtons({
	index,
	length,
	onMove,
	label,
	horizontal,
}: {
	index: number;
	length: number;
	onMove: (to: number) => void;
	label: string;
	horizontal?: boolean;
}) {
	return (
		<span className="inline-flex gap-1">
			<button
				type="button"
				className="adm-btn adm-icon"
				disabled={index === 0}
				onClick={() => onMove(index - 1)}
				aria-label={`${label}: ${horizontal ? 'левее' : 'выше'}`}
				title={horizontal ? 'Левее' : 'Выше'}
			>
				{horizontal ? '←' : '↑'}
			</button>
			<button
				type="button"
				className="adm-btn adm-icon"
				disabled={index === length - 1}
				onClick={() => onMove(index + 1)}
				aria-label={`${label}: ${horizontal ? 'правее' : 'ниже'}`}
				title={horizontal ? 'Правее' : 'Ниже'}
			>
				{horizontal ? '→' : '↓'}
			</button>
		</span>
	);
}

/* ------------------------- Диалог подтверждения -------------------------- */

export interface ConfirmRequest {
	title: string;
	body?: ReactNode;
	confirmLabel: string;
	danger?: boolean;
	onConfirm: () => void;
}

/** Свой диалог вместо window.confirm: Esc и клик по фону — отмена, фокус на «Отмена» */
export function ConfirmDialog({ request, onClose }: { request: ConfirmRequest | null; onClose: () => void }) {
	const cancelRef = useRef<HTMLButtonElement>(null);
	const titleId = useId();
	useEffect(() => {
		if (!request) return;
		const prev = document.activeElement as HTMLElement | null;
		cancelRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('keydown', onKey);
			prev?.focus?.();
		};
	}, [request, onClose]);
	if (!request) return null;
	return (
		<div className="adm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
			<div role="alertdialog" aria-modal="true" aria-labelledby={titleId} className="adm-dialog">
				<div className="p-5">
					<h2 id={titleId} className="text-base font-bold text-fog-50">
						{request.title}
					</h2>
					{request.body && <div className="mt-2 text-sm leading-relaxed text-fog-400">{request.body}</div>}
				</div>
				<div className="flex justify-end gap-2 border-t border-white/8 px-5 py-3">
					<button ref={cancelRef} type="button" className="adm-btn" onClick={onClose}>
						Отмена
					</button>
					<button
						type="button"
						className={`adm-btn ${request.danger ? 'adm-btn-danger' : 'adm-btn-primary'}`}
						onClick={() => {
							request.onConfirm();
							onClose();
						}}
					>
						{request.confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------- Загрузка -------------------------------- */

/** Кнопка «Загрузить»: выбор файлов, сжатие фото, загрузка в Blob, отчёт об ошибках */
export function UploadButton({
	kind,
	multiple,
	label,
	onUploaded,
}: {
	kind: 'image' | 'pdf';
	multiple?: boolean;
	label: string;
	onUploaded: (url: string) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [progress, setProgress] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handle(files: FileList | null) {
		if (!files?.length) return;
		setError(null);
		const list = Array.from(files);
		for (let i = 0; i < list.length; i++) {
			const prefix = list.length > 1 ? `${i + 1}/${list.length}: ` : '';
			setProgress(`${prefix}0%`);
			try {
				const url = await uploadFile(list[i], kind, (p) => setProgress(`${prefix}${p}%`));
				onUploaded(url);
			} catch (e) {
				setError(e instanceof UploadError ? e.message : 'Не удалось загрузить файл');
				break;
			}
		}
		setProgress(null);
		if (inputRef.current) inputRef.current.value = '';
	}

	return (
		<div>
			<input
				ref={inputRef}
				type="file"
				hidden
				multiple={multiple}
				accept={kind === 'image' ? 'image/jpeg,image/png,image/webp' : 'application/pdf'}
				onChange={(e) => handle(e.target.files)}
			/>
			<button type="button" className="adm-btn" disabled={progress !== null} onClick={() => inputRef.current?.click()}>
				{progress !== null ? `Загрузка ${progress}` : label}
			</button>
			{error && <p className="adm-error-text">{error}</p>}
		</div>
	);
}

/* ----------------------------- Мелочи вывода ----------------------------- */

export function formatTime(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function Panel({ title, actions, children, className }: { title: string; actions?: ReactNode; children: ReactNode; className?: string }) {
	return (
		<section className={`adm-panel ${className ?? ''}`}>
			<header className="adm-panel-head">
				<h3 className="adm-panel-title">{title}</h3>
				{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
			</header>
			<div className="p-4">{children}</div>
		</section>
	);
}

/** Элемент списка (вопрос, новость, документ): заголовок, порядок, удаление, сворачивание */
export function ItemShell({
	index,
	length,
	title,
	meta,
	expanded = true,
	onToggle,
	onMove,
	onRemove,
	children,
}: {
	index: number;
	length: number;
	title: string;
	meta?: string;
	expanded?: boolean;
	onToggle?: () => void;
	onMove: (to: number) => void;
	onRemove: () => void;
	children: ReactNode;
}) {
	return (
		<li className="adm-panel">
			<div className={`flex items-center gap-2 px-3 py-2 ${expanded ? 'border-b border-white/7' : ''}`}>
				<span className="tnum w-6 shrink-0 text-xs text-fog-500">{index + 1}</span>
				{onToggle ? (
					<button type="button" className="min-w-0 flex-1 text-left" onClick={onToggle} aria-expanded={expanded}>
						<span className="block truncate font-semibold text-fog-50">{title}</span>
						{meta && <span className="block text-xs text-fog-500">{meta}</span>}
					</button>
				) : (
					<div className="min-w-0 flex-1">
						<span className="block truncate font-semibold text-fog-50">{title}</span>
						{meta && <span className="block text-xs text-fog-500">{meta}</span>}
					</div>
				)}
				<OrderButtons index={index} length={length} label={title} onMove={onMove} />
				<button type="button" className="adm-btn adm-btn-danger adm-icon" aria-label={`Удалить: ${title}`} title="Удалить" onClick={onRemove}>
					×
				</button>
			</div>
			{expanded && <div className="p-3">{children}</div>}
		</li>
	);
}
