import { lazy, Suspense, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Check, ChevronDown } from './Icons';
import { formatPrice, minPrice } from '../seo';
import SplitText from '../motion/SplitText';
import CountUp from '../motion/CountUp';
import { useAfterLoad } from '../motion/useAfterLoad';
import { useMagnetic } from '../motion/useMagnetic';

// Scrub-сцена на gsap: отдельный чанк, подключается после загрузки страницы
const HeroScene = lazy(() => import('../motion/scenes/HeroScene'));

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

	const sceneReady = useAfterLoad();
	const primaryRef = useMagnetic<HTMLButtonElement>();
	const ghostRef = useMagnetic<HTMLButtonElement>();

	const scrollToCatalog = () => {
		document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	return (
		<section
			ref={ref}
			className="relative flex min-h-[100dvh] flex-col justify-end overflow-hidden bg-ink-950 pt-32 pb-10 md:pb-14"
		>
			{sceneReady && (
				<Suspense fallback={null}>
					<HeroScene scope={ref} />
				</Suspense>
			)}

			{/* Кадр техники в среде: главный аргумент первого экрана.
			    Анимируется только transform обёртки (HeroScene), картинка видна сразу. */}
			<div className="absolute inset-0" data-hero-image>
				<img
					src="/images/pickup-1.8/1.webp"
					alt="Снегоболотоход СОКОЛ ПИКАП 1.8 на таёжной просеке"
					className="h-full w-full object-cover object-[60%_center] brightness-110 contrast-[1.05]"
					fetchPriority="high"
					decoding="async"
					width={1024}
					height={1024}
				/>
			</div>

			{/* Затемнение: снизу глухое, сверху лёгкое: читаемость шапки и текста */}
			<div
				aria-hidden
				className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-ink-950)_2%,rgba(8,10,10,0.82)_26%,rgba(8,10,10,0.28)_58%,rgba(8,10,10,0.6)_100%)]"
			/>
			<div
				aria-hidden
				className="absolute inset-0 bg-[radial-gradient(130%_90%_at_25%_95%,transparent_45%,rgba(8,10,10,0.55)_100%)]"
			/>

			<div className="shell relative" data-hero-content>
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

					{/* Заголовок по словам из-под маски: CSS, стартует с первого кадра */}
					<SplitText
						as="h1"
						mode="intro"
						delay={0.06}
						className="mt-5 font-display text-display text-fog-50 uppercase"
						lines={[
							{ text: 'Пройдёт там,', className: 'block' },
							{ text: 'где дорог нет', className: 'block text-accent-200' },
						]}
					/>

					<motion.p
						className="mt-7 max-w-xl text-lede text-fog-200"
						initial={reduce ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
					>
						Снегоболотоходы СОКОЛ 4×4 из Якутска: полный привод, клиренс до 500 мм и шины
						низкого давления. Машина идёт по снегу, болоту и воде, а потом возвращается обратно.
					</motion.p>

					<motion.div
						className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
						initial={reduce ? false : { opacity: 0, y: 18 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
					>
						<button
							ref={primaryRef}
							type="button"
							onClick={() => openRequest()}
							className="btn btn-primary"
						>
							Оставить заявку
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</button>
						<button
							ref={ghostRef}
							type="button"
							onClick={scrollToCatalog}
							className="btn btn-ghost"
						>
							Смотреть модели
							<span className="btn-dot">
								<ChevronDown className="h-4 w-4" />
							</span>
						</button>
					</motion.div>

					{/* Цена-якорь и снятие страхов прямо под кнопками */}
					<motion.div
						className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
						initial={reduce ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.32 }}
					>
						<span className="text-fog-200">
							от <span className="tnum font-semibold text-fog-50">{formatPrice(minPrice)}</span>
						</span>
						{['без предоплаты до согласования', 'тест-драйв в Якутске', 'доставка по России'].map(
							(t) => (
								<span key={t} className="flex items-center gap-1.5 text-fog-400">
									<Check className="h-3.5 w-3.5 text-accent-400" />
									{t}
								</span>
							)
						)}
					</motion.div>
				</div>

				{/* Полоса фактов: цифры вместо обещаний */}
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
								<CountUp
									value={f.value}
									className="tnum font-display text-3xl leading-none text-fog-50 md:text-4xl"
								/>
								{f.unit && (
									<span className="ml-1.5 text-sm font-medium text-accent-200">{f.unit}</span>
								)}
								<span className="mt-2 block text-xs leading-snug text-fog-500">{f.label}</span>
							</dd>
						</div>
					))}
				</motion.dl>
			</div>
		</section>
	);
}
