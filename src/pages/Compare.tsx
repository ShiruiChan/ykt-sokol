import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { useRequestModal } from '../components/RequestModal';
import { ArrowRight, ArrowUpRight, Image as ImageIcon } from '../components/Icons';
import { plural, productPath, products } from '../data/products';
import type { Product } from '../types';

/* -------------------------------------------------------------------------- */
/*  Данные строк                                                              */
/* -------------------------------------------------------------------------- */

/** «В разработке» и пустые строки — это отсутствие данных, а не значение */
const clean = (v?: string) => {
	const s = v?.trim();
	return s && !/^в разработке$/i.test(s) ? s : undefined;
};

/** Первое целое число из строки; для подсветки лучшего значения */
const numberIn = (v: string | undefined, re: RegExp) => {
	const m = v?.match(re);
	return m ? Number(m[1]) : undefined;
};

type Row = {
	label: string;
	/** Основное значение и необязательная приписка мелким шрифтом */
	cell: (p: Product) => { main?: string; sub?: string };
	/** Число для сравнения «больше — лучше». Только там, где формат строки однозначен */
	score?: (p: Product) => number | undefined;
};

const ROWS: Row[] = [
	{
		label: 'Цена от',
		cell: (p) => ({
			main: p.price ? `${p.price.toLocaleString('ru-RU')} ₽` : undefined,
			// Комплект поставки известен только у серийных машин
			sub: p.defaultKit.length ? 'с документами и ЗИП' : undefined,
		}),
	},
	{
		label: 'Клиренс',
		cell: (p) => ({ main: clean(p.specs.clearance) }),
		score: (p) => numberIn(clean(p.specs.clearance), /(\d+)\s*мм/),
	},
	{
		label: 'Мощность',
		cell: (p) => {
			const raw = clean(p.specs.extendedSpecs?.enginePower);
			const hp = raw?.match(/(\d+(?:[.,]\d+)?)\s*л\.с\./)?.[1];
			const kw = raw?.match(/(\d+(?:[.,]\d+)?)\s*кВт/)?.[1];
			return hp ? { main: `${hp} л.с.`, sub: kw ? `${kw} кВт` : undefined } : { main: raw };
		},
		score: (p) => numberIn(clean(p.specs.extendedSpecs?.enginePower), /(\d+)\s*л\.с\./),
	},
	{
		label: 'Двигатель',
		cell: (p) => {
			const raw = clean(p.specs.engine);
			const [model, ...rest] = raw?.split(',').map((s) => s.trim()) ?? [];
			return { main: model, sub: rest.join(', ') || undefined };
		},
	},
	{ label: 'Мест', cell: (p) => ({ main: clean(p.specs.seats)?.replace(/\s*мест[а]?$/i, '') }) },
	{ label: 'Коробка', cell: (p) => ({ main: clean(p.specs.transmission) }) },
	{ label: 'Макс. скорость', cell: (p) => ({ main: clean(p.specs.maxSpeed) }) },
	{ label: 'На плаву', cell: (p) => ({ main: clean(p.specs.extendedSpecs?.waterSpeed) }) },
	{
		label: 'Масса',
		cell: (p) => {
			const full = clean(p.specs.extendedSpecs?.fullWeight);
			return {
				main: clean(p.specs.extendedSpecs?.weight),
				sub: full ? `полная ${full}` : undefined,
			};
		},
	},
	{ label: 'Шины', cell: (p) => ({ main: clean(p.specs.extendedSpecs?.tires)?.replace(/^Бескамерные низкого давления:\s*/i, '') }) },
	{ label: 'Расход', cell: (p) => ({ main: clean(p.specs.fuelConsumption) }) },
];

/** id моделей с лучшим значением. Если у всех одинаково — подсвечивать нечего */
const bestIds = (row: Row) => {
	if (!row.score) return new Set<number>();
	const scored = products
		.map((p) => ({ id: p.id, v: row.score!(p) }))
		.filter((x): x is { id: number; v: number } => x.v !== undefined);
	if (scored.length < 2) return new Set<number>();
	const max = Math.max(...scored.map((x) => x.v));
	const top = scored.filter((x) => x.v === max);
	return top.length === scored.length ? new Set<number>() : new Set(top.map((x) => x.id));
};

const BEST = ROWS.map(bestIds);

const inDevelopment = (p: Product) => !clean(p.specs.engine) && !clean(p.specs.clearance);

/* -------------------------------------------------------------------------- */
/*  Ячейки                                                                    */
/* -------------------------------------------------------------------------- */

// Первая колонка липкая: при горизонтальной прокрутке названия строк остаются на месте
const STICKY =
	'sticky left-0 z-10 w-28 min-w-28 bg-ink-900 px-4 text-left align-top shadow-[1px_0_0_rgb(255_255_255/0.07)] sm:w-40 sm:min-w-40 md:px-6';

function Empty() {
	return (
		<span className="text-fog-500" title="Данных пока нет">
			—<span className="sr-only">нет данных</span>
		</span>
	);
}

function ModelHead({ product }: { product: Product }) {
	const cover = product.images[0];
	return (
		<Link to={productPath(product)} className="group block">
			<span className="relative block aspect-[4/3] overflow-hidden rounded-md border border-white/7 bg-ink-850">
				{cover ? (
					<img
						src={cover}
						alt=""
						className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
						loading="lazy"
						decoding="async"
					/>
				) : (
					<span className="hatch grid h-full w-full place-items-center text-fog-500">
						<ImageIcon className="h-7 w-7 opacity-60" />
					</span>
				)}
				{inDevelopment(product) && (
					<span className="absolute top-2 left-2 rounded-xs bg-ink-950/85 px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-accent-200 uppercase">
						в разработке
					</span>
				)}
			</span>
			<span className="mt-3 block font-display text-sm leading-tight tracking-[0.02em] text-fog-50 uppercase md:text-base">
				{product.name}
			</span>
			<span className="mt-1.5 inline-flex items-center gap-1 text-xs text-fog-500 transition-colors group-hover:text-accent-200">
				Подробнее
				<ArrowRight className="h-3.5 w-3.5" />
			</span>
		</Link>
	);
}

function Value({ main, sub, best }: { main?: string; sub?: string; best: boolean }): ReactNode {
	if (!main) return <Empty />;
	return (
		<>
			<span className={`tnum block font-semibold ${best ? 'text-accent-200' : 'text-fog-50'}`}>
				{main}
				{best && <span className="sr-only"> — лучшее значение</span>}
			</span>
			{sub && <span className="mt-1 block text-xs leading-snug text-fog-500">{sub}</span>}
		</>
	);
}

/* -------------------------------------------------------------------------- */
/*  Страница                                                                  */
/* -------------------------------------------------------------------------- */

export default function Compare() {
	const openRequest = useRequestModal((s) => s.open);
	const n = products.length;

	return (
		<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
			<div className="shell">
				<Reveal className="max-w-2xl">
					<p className="eyebrow">
						<span className="h-px w-8 bg-accent-400/70" />
						сравнение
					</p>
					<h1 className="mt-5 text-title text-fog-50">Сравнить модели</h1>
					<p className="mt-5 text-lede text-fog-400">
						{n} {plural(n, ['машина', 'машины', 'машин'])} в одной таблице: цена, клиренс,
						мотор, места и вес. Зелёным отмечено лучшее значение по клиренсу и мощности.
					</p>
				</Reveal>

				<Reveal delay={0.08} className="mt-12 md:mt-16">
					<p className="mb-3 flex items-center gap-2 text-xs text-fog-500 lg:hidden">
						Таблица листается вбок
						<ArrowRight className="h-3.5 w-3.5" />
					</p>

					{/* Скролл только внутри рамки — сама страница вбок не едет.
					    relative держит внутри и sr-only подписи: иначе они
					    позиционируются от Reveal и раздвигают страницу. */}
					<div className="relative overflow-x-auto overscroll-x-contain rounded-lg border border-white/8 bg-ink-900">
						<table className="w-full min-w-[60rem] border-collapse text-sm">
							<caption className="sr-only">Сравнение характеристик моделей СОКОЛ</caption>
							<thead>
								<tr className="border-b border-white/8">
									<th scope="col" className={`${STICKY} py-5 align-bottom`}>
										<span className="text-[11px] font-medium tracking-[0.16em] text-fog-500 uppercase">
											Параметр
										</span>
									</th>
									{products.map((p) => (
										<th key={p.id} scope="col" className="w-44 px-3 py-5 text-left align-top font-normal md:px-4">
											<ModelHead product={p} />
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{ROWS.map((row, ri) => (
									<tr key={row.label} className="group/row border-b border-white/6 last:border-b-0">
										<th scope="row" className={`${STICKY} py-4 font-medium text-fog-400`}>
											{row.label}
										</th>
										{products.map((p) => {
											const { main, sub } = row.cell(p);
											return (
												<td
													key={p.id}
													className="px-3 py-4 align-top transition-colors group-hover/row:bg-white/2 md:px-4"
												>
													<Value main={main} sub={sub} best={BEST[ri].has(p.id)} />
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="mt-4 text-xs text-fog-500">
						Прочерк — данных пока нет: модель в разработке или параметр не опубликован. Полные
						характеристики — на странице каждой модели.
					</p>
				</Reveal>

				<Reveal
					delay={0.1}
					className="mt-14 flex flex-col gap-5 rounded-lg border border-white/8 bg-ink-900 px-6 py-7 sm:flex-row sm:items-center sm:justify-between md:mt-20 md:px-8"
				>
					<div>
						<p className="font-semibold text-fog-50">Не можете выбрать?</p>
						<p className="mt-1 text-sm text-fog-400">
							Расскажите, где и как будете ездить — инженер подберёт модель и комплектацию.
						</p>
					</div>
					<button
						type="button"
						onClick={() => openRequest('Подобрать модель')}
						className="btn btn-primary shrink-0"
					>
						Подобрать модель
						<span className="btn-dot">
							<ArrowUpRight className="h-4 w-4" />
						</span>
					</button>
				</Reveal>
			</div>

			<div className="h-20 md:h-28" />
		</main>
	);
}
