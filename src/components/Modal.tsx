import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();

	// Esc закрывает, фон не скроллится, фокус уходит внутрь окна
	useEffect(() => {
		if (!isOpen) return;

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', onKey);
		const timer = window.setTimeout(() => panelRef.current?.focus(), 30);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', onKey);
			window.clearTimeout(timer);
		};
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-70 flex items-end justify-center bg-ink-950/85 p-0 backdrop-blur-md sm:items-center sm:p-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: reduce ? 0 : 0.25 }}
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) onClose();
					}}
				>
					<motion.div
						ref={panelRef}
						tabIndex={-1}
						role="dialog"
						aria-modal="true"
						aria-label={title}
						initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
						transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
						className={`relative w-full ${
							size === 'lg' ? 'max-w-4xl' : 'max-w-lg'
						} max-h-[92dvh] overflow-y-auto rounded-t-xl border border-white/8 bg-ink-850 shadow-plate outline-none sm:rounded-xl`}
					>
						<button
							onClick={onClose}
							className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-ink-800/80 text-fog-400 backdrop-blur transition hover:border-white/20 hover:text-fog-50"
							aria-label="Закрыть"
						>
							<Close className="h-5 w-5" />
						</button>

						{title && (
							<div className="border-b border-white/8 px-6 pt-6 pb-5 sm:px-8">
								<h2 className="font-display text-xl tracking-tight text-fog-50 uppercase">
									{title}
								</h2>
							</div>
						)}

						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
