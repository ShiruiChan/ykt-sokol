import type { ImgHTMLAttributes } from 'react';
import { responsiveSource } from '../data/image-variants';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
	src: string;
	/** Обязателен: без sizes браузер считает картинку шириной во весь экран и тянет крупный вариант */
	sizes: string;
	alt: string;
};

/**
 * <img> со srcset и width/height из манифеста scripts/build-image-variants.mjs.
 * width/height задают пропорции до загрузки — сетка не прыгает.
 */
export default function ResponsiveImage({ src, sizes, alt, loading = 'lazy', decoding = 'async', ...rest }: Props) {
	const source = responsiveSource(src);
	return (
		<img
			{...rest}
			src={source.src}
			srcSet={source.srcSet}
			sizes={source.srcSet ? sizes : undefined}
			width={source.width}
			height={source.height}
			alt={alt}
			loading={loading}
			decoding={decoding}
		/>
	);
}
