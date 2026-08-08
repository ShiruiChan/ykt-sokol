/**
 * Собственный набор тонких линейных иконок (stroke 1.25, скруглённые концы).
 * Сделан вручную, чтобы не тянуть Lucide/Feather и не выглядеть шаблонно.
 * Все иконки наследуют currentColor и размер задаётся классом.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.25,
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
	'aria-hidden': true,
	focusable: false,
};

export const ArrowUpRight = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M7 17 17 7M9 7h8v8" />
	</svg>
);

export const ArrowRight = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M4 12h15M13 6l6 6-6 6" />
	</svg>
);

export const ArrowLeft = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M20 12H5M11 18l-6-6 6-6" />
	</svg>
);

export const ChevronDown = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="m5 9 7 7 7-7" />
	</svg>
);

export const Close = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M6 6l12 12M18 6 6 18" />
	</svg>
);

export const Check = (p: IconProps) => (
	<svg {...base} {...p} strokeWidth={2}>
		<path d="m4.5 12.5 5 5 10-11" />
	</svg>
);

/** Колесо низкого давления — проходимость */
export const Tire = (p: IconProps) => (
	<svg {...base} {...p}>
		<circle cx="12" cy="12" r="9" />
		<circle cx="12" cy="12" r="3.4" />
		<path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
	</svg>
);

/** Рама / сварной узел — надёжность конструкции */
export const Frame = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
		<path d="M12 12v9M3 7.5 12 12l9-4.5" />
	</svg>
);

/** Ключ — сервис и запчасти */
export const Wrench = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M15.4 3.6a5.2 5.2 0 0 0-6.1 6.8l-6 6a1.8 1.8 0 0 0 2.5 2.5l6-6a5.2 5.2 0 0 0 6.8-6.1l-2.9 2.9-2.7-.5-.5-2.7z" />
	</svg>
);

/** Термометр — работа на морозе */
export const Frost = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M12 2v20M12 6.5 8.6 4.4M12 6.5l3.4-2.1M12 17.5l-3.4 2.1M12 17.5l3.4 2.1" />
		<path d="m3.3 7 17.4 10M6.7 6.4l.6 3.9M6.7 6.4l3.8-.9M17.3 17.6l-.6-3.9M17.3 17.6l-3.8.9" />
		<path d="m20.7 7-17.4 10M17.3 6.4l-.6 3.9M17.3 6.4l-3.8-.9M6.7 17.6l.6-3.9M6.7 17.6l3.8.9" />
	</svg>
);

/** Документ с печатью — сертификаты, ПСМ */
export const Certificate = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M6 3h7l5 5v6.5" />
		<path d="M13 3v5h5" />
		<path d="M18 20.5V21H6V3" />
		<circle cx="16.5" cy="17" r="3.5" />
		<path d="M14.7 19.8 14 23l2.5-1.3L19 23l-.7-3.2" />
	</svg>
);

/** Завод — собственное производство */
export const Plant = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M3 21h18M4 21V10l5 3.5V10l5 3.5V6l6 3.6V21" />
		<path d="M8 21v-3.5M12 21v-3.5M16.5 21v-3.5" />
	</svg>
);

/** Маршрут / точка на карте */
export const Pin = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z" />
		<circle cx="12" cy="10" r="2.6" />
	</svg>
);

export const Phone = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M6.2 3.5h3l1.4 3.7-2 1.4a11.5 11.5 0 0 0 5.3 5.3l1.4-2 3.7 1.4v3a2 2 0 0 1-2.2 2A16.4 16.4 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2z" />
	</svg>
);

export const Clock = (p: IconProps) => (
	<svg {...base} {...p}>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 7v5.2l3.3 2" />
	</svg>
);

export const Lamp = (p: IconProps) => (
	<svg {...base} {...p}>
		<rect x="3" y="8" width="12" height="8" rx="2" />
		<path d="M15 11h2.5M15 13h2.5M19.5 9.5 22 8M19.5 12H22M19.5 14.5 22 16" />
	</svg>
);

export const Winch = (p: IconProps) => (
	<svg {...base} {...p}>
		<rect x="3" y="8" width="11" height="8" rx="1.5" />
		<circle cx="8.5" cy="12" r="2.2" />
		<path d="M14 12h3.5a2.5 2.5 0 0 1 0 5H16" />
	</svg>
);

export const Cargo = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M3 8.5 12 4l9 4.5-9 4.5z" />
		<path d="M3 8.5v7L12 20l9-4.5v-7M12 13v7" />
	</svg>
);

export const Seat = (p: IconProps) => (
	<svg {...base} {...p}>
		<path d="M7 3h4.5a2.5 2.5 0 0 1 2.5 2.5V13H7z" />
		<path d="M7 13h9a2 2 0 0 1 2 2v1H9a2 2 0 0 1-2-2z" />
		<path d="M6 16v5M18 16v5" />
	</svg>
);

export const Gear = (p: IconProps) => (
	<svg {...base} {...p}>
		<circle cx="12" cy="12" r="3" />
		<path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1 5.3 5.3" />
	</svg>
);

export const Image = (p: IconProps) => (
	<svg {...base} {...p}>
		<rect x="3" y="4.5" width="18" height="15" rx="2" />
		<circle cx="8.5" cy="9.5" r="1.5" />
		<path d="m4 16.5 4.8-4.2a2 2 0 0 1 2.7.1L16 17" />
		<path d="m14 14.5 1.6-1.4a2 2 0 0 1 2.6 0L21 15.5" />
	</svg>
);

export const Instagram = (p: IconProps) => (
	<svg {...base} {...p}>
		<rect x="3.5" y="3.5" width="17" height="17" rx="5" />
		<circle cx="12" cy="12" r="4" />
		<circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
	</svg>
);

/** Иконка категории аксессуаров по русскому названию раздела */
export const categoryIcon = (category: string) => {
	const key = category.toLowerCase();
	if (key.includes('освещ')) return Lamp;
	if (key.includes('безопас')) return Winch;
	if (key.includes('багаж')) return Cargo;
	if (key.includes('комфорт')) return Seat;
	return Gear;
};
