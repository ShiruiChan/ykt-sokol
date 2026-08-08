import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, ChevronDown } from './Icons';

/** Цифры, которые продают: берём из реальных характеристик линейки */
const FACTS = [
	{ value: '500', unit: 'мм', label: 'дорожный просвет' },
	{ value: '140', unit: 'л.с.', label: 'двигатель Toyota' },
	{ value: '4×4', unit: '', label: 'постоянный полный' },
	{ value: '−50', unit: '°C', label: 'рабочая температура' },
];

export default function Hero() {
	const ref = useRef<HTMLElement>(null);
	const reduce = useReducedMotion();
	const openRequest = useRequestModal((s) => s.open);

	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ['start start', 'end start'],
	});
	// Лёгкий параллакс кадра: только transform, без изменения layout
	const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
	const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);
	const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

	const scrollToCatalog = () => {
		document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	return (
		<section
			ref={ref}
			className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-ink-950 pt-32 pb-10 md:pb-14"
		>
			{/* Кадр техники в среде — главный аргумент первого экрана */}
			<motion.div
				className="absolute inset-0"
				style={reduce ? undefined : { y: imageY, scale: imageScale }}
			>
				<img
					src="/images/pickup-1.8/1.webp"
					alt="Снегоболотоход СОКОЛ ПИКАП 1.8 на таёжной просеке"
					className="h-full w-full object-cover object-[60%_center] brightness-110 contrast-[1.05]"
					fetchPriority="high"
					decoding="async"
					width={1024}
					height={1024}
				/>
			</motion.div>

			{/* Затемнение: снизу глухое, сверху лёгкое — читаемость шапки и текста */}
			<div
				aria-hidden
				className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink-950)_2%,rgba(8,10,10,0.82)_26%,rgba(8,10,10,0.28)_58%,rgba(8,10,10,0.6)_100%)]"
			/>
			<div
				aria-hidden
				className="absolute inset-0 bg-[radial-gradient(130%_90%_at_25%_95%,transparent_45%,rgba(8,10,10,0.55)_100%)]"
			/>

			<motion.div
				className="shell relative"
				style={reduce ? undefined : { opacity: contentOpacity }}
			>
				<div className="max-w-3xl">
					<motion.p
						className="eyebrow"
						initial={reduce ? false : { opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
					>
						<span className="h-px w-8 bg-accent-400/70" />
						Якутск · собственное производство
					</motion.p>

					<motion.h1
						className="mt-5 font-display text-display text-fog-50 uppercase"
						initial={reduce ? false : { opacity: 0, y: 26 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.9, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
					>
						Пройдёт там,
						<br />
						<span className="text-accent-200">где дорог нет</span>
					</motion.h1>

					<motion.p
						className="mt-7 max-w-xl text-lede text-fog-200"
						initial={reduce ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
					>
						Снегоболотоходы СОКОЛ 4×4 из Якутска: полный привод, клиренс до 500 мм и шины
						низкого давления. Машина идёт по снегу, болоту и воде — и возвращается обратно.
					</motion.p>

					<motion.div
						className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
						initial={reduce ? false : { opacity: 0, y: 18 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
					>
						<button type="button" onClick={() => openRequest()} className="btn btn-primary">
							Оставить заявку
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</button>
						<button type="button" onClick={scrollToCatalog} className="btn btn-ghost">
							Смотреть модели
							<span className="btn-dot">
								<ChevronDown className="h-4 w-4" />
							</span>
						</button>
					</motion.div>
				</div>

				{/* Полоса фактов — цифры вместо обещаний */}
				<motion.dl
					className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 md:mt-16 md:grid-cols-4 md:backdrop-blur-md"
					initial={reduce ? false : { opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.9, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
				>
					{FACTS.map((f) => (
						<div key={f.label} className="bg-ink-950/88 px-5 py-5 md:bg-ink-950/70 md:px-6 md:py-6">
							<dt className="sr-only">{f.label}</dt>
							<dd>
								<span className="tnum font-display text-3xl leading-none text-fog-50 md:text-4xl">
									{f.value}
								</span>
								{f.unit && (
									<span className="ml-1.5 text-sm font-medium text-accent-200">{f.unit}</span>
								)}
								<span className="mt-2 block text-xs leading-snug text-fog-500">{f.label}</span>
							</dd>
						</div>
					))}
				</motion.dl>
			</motion.div>
		</section>
	);
}
