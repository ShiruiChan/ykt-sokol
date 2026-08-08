import { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from './Icons';

interface ImageGalleryProps {
	images: string[];
	/** Название модели для осмысленного alt */
	alt?: string;
}

export default function ImageGallery({ images, alt = 'Снегоболотоход СОКОЛ' }: ImageGalleryProps) {
	const [index, setIndex] = useState(0);
	const [direction, setDirection] = useState(1);
	const reduce = useReducedMotion();

	const go = (next: number, dir: number) => {
		setDirection(dir);
		setIndex((next + images.length) % images.length);
	};

	const next = () => go(index + 1, 1);
	const prev = () => go(index - 1, -1);

	const handlers = useSwipeable({
		onSwipedLeft: next,
		onSwipedRight: prev,
		trackMouse: false,
	});

	// Стрелками с клавиатуры — как в нормальном просмотрщике
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') next();
			if (e.key === 'ArrowLeft') prev();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	if (!images.length) return null;

	return (
		<div className="w-full">
			<div
				{...handlers}
				className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-ink-900"
			>
				<AnimatePresence mode="wait" initial={false}>
					<motion.img
						key={images[index]}
						src={images[index]}
						alt={`${alt} — фото ${index + 1} из ${images.length}`}
						className="absolute inset-0 h-full w-full object-cover"
						initial={reduce ? false : { opacity: 0, x: direction * 24 }}
						animate={{ opacity: 1, x: 0 }}
						exit={reduce ? undefined : { opacity: 0, x: direction * -24 }}
						transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
						decoding="async"
					/>
				</AnimatePresence>

				{images.length > 1 && (
					<>
						<button
							type="button"
							onClick={prev}
							aria-label="Предыдущее фото"
							className="absolute top-1/2 left-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-ink-950/60 text-fog-50 backdrop-blur transition hover:bg-ink-950/85"
						>
							<ArrowLeft className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={next}
							aria-label="Следующее фото"
							className="absolute top-1/2 right-3 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-ink-950/60 text-fog-50 backdrop-blur transition hover:bg-ink-950/85"
						>
							<ArrowRight className="h-5 w-5" />
						</button>

						<span className="tnum absolute right-4 bottom-4 rounded-full bg-ink-950/70 px-3 py-1 text-xs text-fog-200 backdrop-blur">
							{index + 1} / {images.length}
						</span>
					</>
				)}
			</div>

			{images.length > 1 && (
				<div className="mt-3 flex min-w-0 gap-2 overflow-x-auto pb-1">
					{images.map((src, i) => (
						<button
							key={src}
							type="button"
							onClick={() => go(i, i > index ? 1 : -1)}
							aria-label={`Фото ${i + 1}`}
							aria-current={i === index}
							className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xs border transition-colors duration-300 ${
								i === index
									? 'border-accent-500'
									: 'border-white/10 opacity-60 hover:opacity-100'
							}`}
						>
							<img
								src={src}
								alt=""
								className="h-full w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
