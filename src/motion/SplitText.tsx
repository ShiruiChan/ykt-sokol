/**
 * Сплит заголовка по словам под маску. Без платных плагинов.
 *
 * Доступность и SEO:
 *  • сам тег (h1/h2) остаётся целым, полный текст лежит в aria-label;
 *  • кусочки помечены aria-hidden, пробелы между словами: обычные
 *    текстовые узлы, поэтому textContent читается как одна строка без дублей;
 *  • при prefers-reduced-motion сплита нет вовсе: обычный текст.
 *
 * mode="intro": слова поднимаются CSS-анимацией сразу при первой отрисовке
 *               (первый экран, не ждём загрузки gsap).
 * mode="scroll": слова получают .split-word, анимирует их сцена gsap.
 */
import type { CSSProperties, ElementType } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface SplitLine {
	text: string;
	/** Классы строки: цвет, display (block / sm:block и т. п.) */
	className?: string;
}

interface SplitTextProps {
	as?: ElementType;
	lines: SplitLine[];
	className?: string;
	mode?: 'intro' | 'scroll';
	/** Задержка первого слова в intro, сек */
	delay?: number;
}

export default function SplitText({
	as: Tag = 'h2',
	lines,
	className,
	mode = 'scroll',
	delay = 0,
}: SplitTextProps) {
	const reduce = useReducedMotion();
	const label = lines.map((l) => l.text).join(' ');

	if (reduce) {
		return (
			<Tag className={className}>
				{lines.map((line, li) => (
					<span key={li} className={line.className}>
						{li > 0 && ' '}
						{line.text}
					</span>
				))}
			</Tag>
		);
	}

	let i = 0;

	return (
		<Tag className={className} aria-label={label} data-split={mode}>
			{lines.map((line, li) => {
				const words = line.text.split(/\s+/).filter(Boolean);
				return (
					<span key={li} className={line.className} aria-hidden>
						{li > 0 && ' '}
						{words.map((word, wi) => {
							const style = { '--i': i++, '--d': `${delay}s` } as CSSProperties;
							return (
								<span key={wi}>
									{wi > 0 && ' '}
									<span className="split-mask">
										<span className="split-word" style={style}>
											{word}
										</span>
									</span>
								</span>
							);
						})}
					</span>
				);
			})}
		</Tag>
	);
}
