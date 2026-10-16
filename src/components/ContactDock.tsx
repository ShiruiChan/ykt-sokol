/**
 * Плавающая кнопка связи для телефонов: WhatsApp, Telegram, звонок.
 * На десктопе контакты и так в шапке, поэтому только до lg.
 * Над панелью сметы на странице модели кнопка поднимается, чтобы не
 * перекрывать «Оформить».
 */
import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { MESSENGERS, PHONE } from '../config/site';
import { useBottomBar } from '../utils/dockOffset';
import { Close, Phone, Telegram, WhatsApp } from './Icons';

const ACTIONS = [
	{ key: 'whatsapp', label: 'WhatsApp', href: MESSENGERS.whatsapp, Icon: WhatsApp, external: true },
	{ key: 'telegram', label: 'Telegram', href: MESSENGERS.telegram, Icon: Telegram, external: true },
	{ key: 'phone', label: 'Позвонить', href: PHONE.href, Icon: Phone, external: false },
] as const;

export default function ContactDock() {
	const [open, setOpen] = useState(false);
	const reduce = useReducedMotion();
	const { pathname } = useLocation();
	const barVisible = useBottomBar((s) => s.visible);
	const rootRef = useRef<HTMLDivElement>(null);
	const menuId = useId();

	// Высота панели сметы ~4.5rem — поднимаемся над ней
	const raised = barVisible && pathname.startsWith('/models/');

	// Переход на другую страницу закрывает меню
	useEffect(() => setOpen(false), [pathname]);

	// Esc и тап мимо закрывают раскрывашку
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		const onDown = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('pointerdown', onDown);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('pointerdown', onDown);
		};
	}, [open]);

	return (
		<div
			ref={rootRef}
			className={`fixed right-4 z-40 flex flex-col items-end gap-3 transition-[bottom] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:hidden ${
				raised ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))]' : 'bottom-[calc(1rem+env(safe-area-inset-bottom))]'
			}`}
		>
			<AnimatePresence>
				{open && (
					<m.ul
						id={menuId}
						className="flex flex-col items-end gap-2"
						initial={reduce ? false : { opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
						transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
					>
						{ACTIONS.map(({ key, label, href, Icon, external }) => (
							<li key={key}>
								<a
									href={href}
									{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
									onClick={() => setOpen(false)}
									className="flex items-center gap-3 rounded-full border border-white/10 bg-ink-850/95 py-2 pr-2 pl-4 text-sm font-semibold text-fog-50 shadow-plate backdrop-blur-xl transition-colors hover:border-white/20"
								>
									<span>{label}</span>
									<span className="grid h-9 w-9 place-items-center rounded-full bg-white/8 text-accent-200">
										<Icon className="h-[18px] w-[18px]" />
									</span>
								</a>
							</li>
						))}
					</m.ul>
				)}
			</AnimatePresence>

			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				aria-label={open ? 'Скрыть способы связи' : 'Связаться с нами'}
				className="grid h-14 w-14 place-items-center rounded-full bg-accent-500 text-white shadow-plate transition-transform duration-300 active:scale-95"
			>
				{open ? <Close className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
			</button>
		</div>
	);
}
