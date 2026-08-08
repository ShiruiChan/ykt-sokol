import { useState, type ImgHTMLAttributes } from 'react';
import { Image as ImageIcon } from './Icons';

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
	src?: string;
	alt: string;
	/** Классы для контейнера-заглушки, если картинка не загрузилась */
	wrapperClassName?: string;
}

/**
 * Картинка, которая не ломает вёрстку. Если файла нет или внешний хост
 * не ответил — вместо битой иконки браузера показываем аккуратную
 * штриховую заглушку в тон интерфейсу.
 */
export default function SmartImage({
	src,
	alt,
	className,
	wrapperClassName,
	...rest
}: SmartImageProps) {
	const [failed, setFailed] = useState(false);

	if (!src || failed) {
		return (
			<div
				className={`hatch grid place-items-center bg-ink-900 text-fog-500 ${
					wrapperClassName ?? className ?? ''
				}`}
				role="img"
				aria-label={alt}
			>
				<ImageIcon className="h-8 w-8 opacity-50" />
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			className={className}
			loading="lazy"
			decoding="async"
			onError={() => setFailed(true)}
			{...rest}
		/>
	);
}
