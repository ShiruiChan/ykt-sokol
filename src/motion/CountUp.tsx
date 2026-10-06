/**
 * Счётчик «от нуля до значения» при первом попадании во вьюпорт, один раз.
 * Без gsap: IntersectionObserver + rAF, чтобы не тянуть библиотеку на первый экран.
 *
 * Без CLS: обе версии числа лежат в одной ячейке inline-grid. Настоящее
 * значение резервирует ширину и читается скринридером (opacity, не visibility),
 * анимированная копия aria-hidden и после финиша удаляется из DOM.
 */
import { useEffect, useRef, useState } from 'react';
import { matches, MQ } from './media';

interface CountUpProps {
	/** Строка как в данных: «500», «−50», «288». Нечисловые значения выводятся как есть. */
	value: string;
	className?: string;
	/** сек */
	duration?: number;
}

const MINUS = '−';

function parse(value: string) {
	const m = value.trim().match(/^([−-])?(\d+)$/);
	if (!m) return null;
	return (m[1] ? -1 : 1) * Number(m[2]);
}

const format = (n: number) => (n < 0 ? MINUS : '') + Math.abs(n).toString();
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function CountUp({ value, className, duration = 1.4 }: CountUpProps) {
	const target = parse(value);
	const [running, setRunning] = useState(() => target !== null && !matches(MQ.reduce));
	const rootRef = useRef<HTMLSpanElement>(null);
	const liveRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!running || target === null) return;
		const root = rootRef.current;
		if (!root) return;

		let raf = 0;
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				io.disconnect();
				const start = performance.now();
				const tick = (now: number) => {
					const t = Math.min((now - start) / (duration * 1000), 1);
					if (liveRef.current) liveRef.current.textContent = format(Math.round(target * easeOutExpo(t)));
					if (t < 1) raf = requestAnimationFrame(tick);
					else setRunning(false);
				};
				raf = requestAnimationFrame(tick);
			},
			{ rootMargin: '0px 0px -10% 0px' }
		);
		io.observe(root);

		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	}, [running, target, duration]);

	return (
		<span ref={rootRef} className={`inline-grid ${className ?? ''}`}>
			<span className={`col-start-1 row-start-1 ${running ? 'opacity-0' : ''}`}>{value}</span>
			{running && (
				<span ref={liveRef} aria-hidden className="col-start-1 row-start-1 text-right">
					{format(0)}
				</span>
			)}
		</span>
	);
}
