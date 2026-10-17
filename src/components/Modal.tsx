import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { Close } from './Icons';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	/** Заголовок для скринридера и шапки окна */
	title?: string;
	/** Ширина окна: обычная карточка или широкая галерея */
	size?: 'md' | 'lg';
}

const FOCUSABLE =
	'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/** Только реально видимые элементы — скрытый honeypot и т.п. не ловят фокус */
const focusables = (root: HTMLElement) =>
	Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
		(el) => el.offsetParent !== null || el.getClientRects().length > 0
	);

export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const titleId = useId();

	// onClose часто приходит новой стрелкой на каждый рендер — держим в ref,
	// иначе эффект перезапускался бы и дёргал фокус туда-обратно
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	// Esc закрывает, фон не скроллится, фокус заперт в окне и возвращается назад
	useEffect(() => {
		if (!isOpen) return;

		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCloseRef.current();
				return;
			}
			if (e.key !== 'Tab') return;

			const panel = panelRef.current;
			if (!panel) return;
			const items = focusables(panel);
			if (!items.length) {
				e.preventDefault();
				panel.focus();
				return;
			}

			const first = items[0];
			const last = items[items.length - 1];
			const active = document.activeElement;
			const inside = active instanceof Node && panel.contains(active);

			if (e.shiftKey && (active === first || active === panel || !inside)) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && (active === last || !inside)) {
				e.preventDefault();
				first.focus();
			}
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', onKey);
		const timer = window.setTimeout(() => panelRef.current?.focus(), 30);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', onKey);
			window.clearTimeout(timer);
			// Кнопка-открывашка могла исчезнуть из DOM — тогда фокус не трогаем
			if (opener?.isConnected) opener.focus({ preventScroll: true });
		};
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<m.div
					className="fixed inset-0 z-70 flex items-end justify-center bg-ink-950/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: reduce ? 0 : 0.25 }}
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) onClose();
					}}
				>
					<m.div
						ref={panelRef}
						tabIndex={-1}
						role="dialog"
						aria-modal="true"
						aria-labelledby={title ? titleId : undefined}
						initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
						transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
						className={`relative w-full ${
							size === 'lg' ? 'max-w-4xl' : 'max-w-lg'
						} max-h-[92dvh] overflow-y-auto rounded-t-xl border border-white/8 bg-ink-850 shadow-plate outline-none sm:rounded-xl`}
					>
						<button
							type="button"
							onClick={onClose}
							className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-ink-800/80 text-fog-400 backdrop-blur transition hover:border-white/20 hover:text-fog-50"
							aria-label="Закрыть"
						>
							<Close className="h-5 w-5" />
						</button>

						{title && (
							<div className="border-b border-white/8 px-6 pt-6 pb-5 sm:px-8">
								<h2
									id={titleId}
									className="font-display text-xl tracking-tight text-fog-50 uppercase"
								>
									{title}
								</h2>
							</div>
						)}

						{children}
					</m.div>
				</m.div>
			)}
		</AnimatePresence>
	);
}
