import { PhotoView } from 'react-photo-view';

interface GalleryCardProps {
	src: string;
	index: number;
	/** Собственные размеры файла: браузер резервирует место до загрузки (CLS = 0) */
	width: number;
	height: number;
}

/**
 * Плитка галереи. PhotoProvider живёт на странице: один на всю сетку,
 * иначе лайтбокс не листает соседние снимки.
 *
 * Появление (clip-path) и параллакс делает GalleryScene на gsap:
 * рамка [data-gal-frame] открывается шторкой, слой [data-gal-parallax] плывёт
 * внутри неё, а hover-увеличение живёт на самой картинке. Три разных элемента.
 */
export default function GalleryCard({ src, index, width, height }: GalleryCardProps) {
	return (
		<figure className="group mb-4 break-inside-avoid">
			<PhotoView src={src}>
				<div
					data-gal-frame
					className="relative cursor-zoom-in overflow-hidden rounded-md border border-white/7 bg-ink-900"
				>
					<div data-gal-parallax>
						<img
							src={src}
							alt={`Снегоболотоход СОКОЛ, кадр ${index + 1}`}
							width={width}
							height={height}
							loading="lazy"
							decoding="async"
							className="h-auto w-full transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
						/>
					</div>
					<div
						aria-hidden
						className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,10,0.7),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					/>
					<span className="tnum absolute bottom-3 left-3 text-xs tracking-[0.16em] text-fog-200 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
						{String(index + 1).padStart(2, '0')}
					</span>
				</div>
			</PhotoView>
		</figure>
	);
}
