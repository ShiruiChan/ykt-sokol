import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Phone } from './Icons';

/**
 * Нижняя панель на телефоне: звонок и заявка всегда под большим пальцем.
 * Появляется после первого экрана и прячется у подвала, где свой призыв.
 */
export default function MobileCta() {
	const [visible, setVisible] = useState(false);
	const openRequest = useRequestModal((s) => s.open);

	useEffect(() => {
		const onScroll = () => {
			const pastHero = window.scrollY > window.innerHeight * 0.8;
			const nearEnd =
				window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 520;
			setVisible(pastHero && !nearEnd);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, []);

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{ y: 90 }}
					animate={{ y: 0 }}
					exit={{ y: 90 }}
					transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
					className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/92 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
				>
					<div className="flex gap-2">
						<a
							href="tel:+79969141414"
							className="btn btn-ghost flex-1 px-4 py-3 text-sm"
							aria-label="Позвонить: +7 (996) 914-14-14"
						>
							<Phone className="h-4 w-4 text-accent-400" />
							Позвонить
						</a>
						<button
							type="button"
							onClick={() => openRequest()}
							className="btn btn-primary flex-1 py-3 pr-3 pl-5 text-sm"
						>
							Заявка
							<span className="btn-dot h-7 w-7">
								<ArrowUpRight className="h-3.5 w-3.5" />
							</span>
						</button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
