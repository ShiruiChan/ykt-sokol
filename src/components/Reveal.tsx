/**
 * Появление элемента при входе в вьюпорт: мягкий подъём + проявление.
 * Двигаем только transform/opacity. При prefers-reduced-motion анимация
 * отключается полностью — контент показывается сразу.
 */
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
	children: ReactNode;
	/** Задержка каскада, сек */
	delay?: number;
	/** Смещение по вертикали до появления, px */
	y?: number;
	className?: string;
	as?: 'div' | 'section' | 'article' | 'li' | 'header' | 'aside';
}

export default function Reveal({
	children,
	delay = 0,
	y = 28,
	className,
	as = 'div',
}: RevealProps) {
	const reduce = useReducedMotion();
	const Tag = motion[as];

	if (reduce) {
		const Plain = as;
		return <Plain className={className}>{children}</Plain>;
	}

	return (
		<Tag
			className={className}
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-80px' }}
			transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</Tag>
	);
}
