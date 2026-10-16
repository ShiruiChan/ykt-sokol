import { m, useReducedMotion } from 'framer-motion';
import ResponsiveImage from './ResponsiveImage';
import type { GalleryPhoto } from '../data/gallery';

interface GalleryCardProps {
	photo: GalleryPhoto;
	index: number;
	sizes: string;
	onOpen: () => void;
}

/**
 * Плитка галереи: превью из srcset, полноразмерный кадр открывает лайтбокс страницы.
 * width/height из манифеста держат пропорции до загрузки — колонки не прыгают.
 */
export default function GalleryCard({ photo, index, sizes, onOpen }: GalleryCardProps) {
	const reduce = useReducedMotion();

	return (
		<m.figure
			className="group"
			initial={reduce ? false : { opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-60px' }}
			transition={{ duration: 0.7, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
		>
			<button
				type="button"
				onClick={onOpen}
				aria-label={`${photo.alt}. Открыть в полном размере`}
				className="relative block w-full cursor-zoom-in overflow-hidden rounded-md border border-white/7 bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
			>
				<ResponsiveImage
					src={photo.src}
					sizes={sizes}
					alt={photo.alt}
					className="block h-auto w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
				/>
				<div
					aria-hidden
					className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,10,0.7),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				/>
				<span
					aria-hidden
					className="tnum absolute bottom-3 left-3 text-xs tracking-[0.16em] text-fog-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				>
					{String(index + 1).padStart(2, '0')}
				</span>
			</button>
		</m.figure>
	);
}
