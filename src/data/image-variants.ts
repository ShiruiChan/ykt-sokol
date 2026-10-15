import { IMAGE_VARIANTS, GALLERY, type ImageVariants } from './image-variants.gen';

export { GALLERY, IMAGE_VARIANTS };
export type { ImageVariants };

export interface ResponsiveSource {
	src: string;
	srcSet?: string;
	width?: number;
	height?: number;
}

const toSrcSet = (v: ImageVariants) => v.srcset.map(([s, w]) => `${s} ${w}w`).join(', ');

/**
 * Атрибуты <img> по пути из public. Если картинки нет в манифесте
 * (новый файл, скрипт ещё не прогоняли) — отдаём просто src, без srcset.
 */
export function responsiveSource(src: string): ResponsiveSource {
	const v = IMAGE_VARIANTS[src];
	if (!v) return { src };
	return { src, srcSet: toSrcSet(v), width: v.w, height: v.h };
}

/** Самый крупный вариант — для лайтбокса и случаев без srcset */
export function largestVariant(src: string): string {
	const v = IMAGE_VARIANTS[src];
	return v ? v.srcset[v.srcset.length - 1][0] : src;
}
