import { useId, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { ChevronDown } from './Icons';
import type { FaqItem } from '../data/faq';

interface FaqProps {
	items: FaqItem[];
	/** Какой вопрос раскрыт сразу; по умолчанию все свёрнуты */
	defaultOpen?: number | null;
	className?: string;
}

/**
 * Аккордеон вопросов. Открыт один пункт за раз — так список не
 * разъезжается на экран и проще найти следующий вопрос.
 * Анимация высоты — как в характеристиках на странице модели.
 */
export default function Faq({ items, defaultOpen = null, className }: FaqProps) {
	const [open, setOpen] = useState<number | null>(defaultOpen);
	const reduce = useReducedMotion();
	const baseId = useId();

	return (
		<div className={`border-t border-white/8 ${className ?? ''}`}>
			{items.map((item, i) => {
				const isOpen = open === i;
				const btnId = `${baseId}-q${i}`;
				const panelId = `${baseId}-a${i}`;
				return (
					<div key={item.q} className="border-b border-white/8">
						<h3>
							<button
								id={btnId}
								type="button"
								aria-expanded={isOpen}
								aria-controls={panelId}
								onClick={() => setOpen(isOpen ? null : i)}
								className="group flex w-full items-center justify-between gap-6 py-5 text-left md:py-6"
							>
								<span
									className={`text-base font-semibold transition-colors duration-300 md:text-lg ${
										isOpen ? 'text-fog-50' : 'text-fog-200 group-hover:text-fog-50'
									}`}
								>
									{item.q}
								</span>
								<span className="btn-dot shrink-0 bg-white/8">
									<ChevronDown
										className={`h-4 w-4 text-fog-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
											isOpen ? 'rotate-180' : ''
										}`}
									/>
								</span>
							</button>
						</h3>
						<AnimatePresence initial={false}>
							{isOpen && (
								<m.div
									id={panelId}
									role="region"
									aria-labelledby={btnId}
									initial={reduce ? false : { height: 0, opacity: 0 }}
									animate={{ height: 'auto', opacity: 1 }}
									exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
									transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
									className="overflow-hidden"
								>
									<p className="max-w-3xl pr-12 pb-6 text-sm leading-relaxed text-fog-400 md:text-base">
										{item.a}
									</p>
								</m.div>
							)}
						</AnimatePresence>
					</div>
				);
			})}
		</div>
	);
}
