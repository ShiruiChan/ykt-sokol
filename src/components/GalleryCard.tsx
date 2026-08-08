import { motion, useReducedMotion } from 'framer-motion';
import { PhotoView } from 'react-photo-view';

interface GalleryCardProps {
	src: string;
	index: number;
}

/**
 * Плитка галереи. PhotoProvider живёт на странице — один на всю сетку,
 * иначе лайтбокс не листает соседние снимки.
 */
export default function GalleryCard({ src, index }: GalleryCardProps) {
	const reduce = useReducedMotion();

	return (
		<motion.figure
			className="group mb-4 break-inside-avoid"
			initial={reduce ? false : { opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			transition={{ duration: 0.7, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
		>
			<PhotoView src={src}>
				<div className="relative cursor-zoom-in overflow-hidden rounded-md border border-white/7 bg-ink-900">
					<img
						src={src}
						alt={`Снегоболотоход СОКОЛ — кадр ${index + 1}`}
						loading="lazy"
						decoding="async"
						className="w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
					/>
					<div
						aria-hidden
						className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,10,0.7),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					/>
					<span className="tnum absolute bottom-3 left-3 text-xs tracking-[0.16em] text-fog-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
						{String(index + 1).padStart(2, '0')}
					</span>
				</div>
			</PhotoView>
		</motion.figure>
	);
}
