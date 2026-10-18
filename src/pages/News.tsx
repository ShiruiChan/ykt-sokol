import { useState } from 'react';
import { newsList } from '../data/news';
import Reveal from '../components/Reveal';
import SmartImage from '../components/SmartImage';
import { ArrowUpRight, ChevronDown } from '../components/Icons';
import type { NewsItem } from '../types';

// UTC — чтобы дата при пререндере и в браузере не уезжала на день
const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC',
	});

const dateParts = (iso: string) => {
	const d = new Date(iso);
	return {
		day: d.toLocaleDateString('ru-RU', { day: 'numeric', timeZone: 'UTC' }),
		month: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).replace(/^\d+\s*/, ''),
		year: d.toLocaleDateString('ru-RU', { year: 'numeric', timeZone: 'UTC' }).replace(/\D/g, ''),
	};
};

/** Ссылка на первоисточник; для роликов восстанавливаем адрес из id превью */
const sourceOf = (item: NewsItem): { url: string; name: string } | null => {
	if (item.sourceUrl) return { url: item.sourceUrl, name: item.sourceName ?? new URL(item.sourceUrl).hostname.replace(/^www\./, '') };
	const yt = item.image?.match(/i\.ytimg\.com\/vi\/([\w-]+)\//);
	if (yt) return { url: `https://www.youtube.com/watch?v=${yt[1]}`, name: item.sourceName ?? 'YouTube' };
	return null;
};

/**
 * Обложка новости. Если превью нет — типографическая карточка:
 * крупная дата и издание. Честнее штриховой заглушки «здесь была картинка».
 */
function Cover({ item, lead = false }: { item: NewsItem; lead?: boolean }) {
	const radius = lead ? 'rounded-[calc(2rem-0.375rem)]' : 'rounded-md border border-white/7';
	const aspect = lead ? 'aspect-[16/10]' : 'aspect-[4/3]';

	if (item.image) {
		return (
			<SmartImage
				src={item.image}
				alt={item.title}
				className={`${aspect} w-full ${radius} object-cover`}
				wrapperClassName={`${aspect} w-full ${radius}`}
			/>
		);
	}

	const { day, month, year } = dateParts(item.date);
	return (
		<div
			aria-hidden
			className={`${aspect} relative flex w-full flex-col justify-between overflow-hidden bg-ink-900 ${radius} ${
				lead ? 'p-7 md:p-10' : 'p-5'
			}`}
		>
			<div
				className="absolute inset-0 bg-[radial-gradient(90%_80%_at_100%_0%,color-mix(in_oklab,var(--color-accent-500)_14%,transparent)_0%,transparent_70%)]"
			/>
			<span
				className={`relative font-display tracking-[0.22em] text-accent-200 uppercase ${
					lead ? 'text-xs' : 'text-[10px]'
				}`}
			>
				{item.sourceName ?? 'пресса'}
			</span>
			<span className="relative">
				<span
					className={`tnum block font-display leading-[0.85] text-fog-50 ${
						lead ? 'text-[clamp(5rem,3rem+8vw,9rem)]' : 'text-6xl'
					}`}
				>
					{day}
				</span>
				<span
					className={`mt-2 flex items-baseline justify-between gap-3 border-t border-white/10 pt-3 text-fog-400 ${
						lead ? 'text-base' : 'text-xs'
					}`}
				>
					<span>{month}</span>
					<span className="tnum">{year}</span>
				</span>
			</span>
		</div>
	);
}

function Source({ item }: { item: NewsItem }) {
	const src = sourceOf(item);
	if (!src) return null;
	return (
		<div className="mt-4">
			<a href={src.url} target="_blank" rel="noopener noreferrer" className="link-quiet text-sm">
				Источник: {src.name}
				<ArrowUpRight className="h-4 w-4" />
			</a>
		</div>
	);
}

const byDateDesc = (a: NewsItem, b: NewsItem) => +new Date(b.date) - +new Date(a.date);

/** Раскрывающийся текст вместо ссылки «Читать далее» в никуда */
function ReadMore({ item }: { item: NewsItem }) {
	const [open, setOpen] = useState(false);
	const short = item.summary || item.content.slice(0, 180);

	return (
		<>
			<p className="mt-3 text-sm leading-relaxed text-fog-400">{open ? item.content : short}</p>
			{item.content !== short && (
				<button
					type="button"
					onClick={() => setOpen((v) => !v)}
					aria-expanded={open}
					className="link-quiet mt-4 text-sm"
				>
					{open ? 'Свернуть' : 'Читать целиком'}
					<ChevronDown
						className={`h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
							open ? 'rotate-180' : ''
						}`}
					/>
				</button>
			)}
		</>
	);
}

function Tags({ tags }: { tags?: string[] }) {
	if (!tags?.length) return null;
	return (
		<ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
			{tags.map((t) => (
				<li key={t} className="text-[11px] tracking-[0.16em] text-fog-500 uppercase">
					{t}
				</li>
			))}
		</ul>
	);
}

export default function News() {
	const pinned = newsList.filter((n) => n.isPinned).sort(byDateDesc);
	const rest = newsList.filter((n) => !n.isPinned).sort(byDateDesc);
	const [lead, ...otherPinned] = pinned;

	return (
		<>
			<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
				<div className="shell">
					<Reveal className="max-w-2xl">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							пресса и события
						</p>
						<h1 className="mt-5 text-title text-fog-50">Новости</h1>
						<p className="mt-5 text-lede text-fog-400">
							Что происходит на производстве и где сегодня работают наши машины.
						</p>
					</Reveal>

					{/* Главный материал — крупным планом, а не одной из карточек в ряду */}
					{lead && (
						<Reveal delay={0.08} as="article" className="mt-14 md:mt-20">
							<div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
								<div className="bezel lg:col-span-7">
									<Cover item={lead} lead />
								</div>
								<div className="flex flex-col justify-center lg:col-span-5">
									<div className="flex items-center gap-3 text-xs">
										<span className="rounded-xs bg-accent-900 px-2 py-1 font-semibold tracking-[0.14em] text-accent-200 uppercase">
											главное
										</span>
										<time dateTime={lead.date} className="tnum text-fog-500">
											{formatDate(lead.date)}
										</time>
									</div>
									<h2 className="mt-5 text-heading text-fog-50">{lead.title}</h2>
									<ReadMore item={lead} />
									<Tags tags={lead.tags} />
									<Source item={lead} />
								</div>
							</div>
						</Reveal>
					)}

					{/* Остальное — редакционный список с волосяными линиями */}
					<div className="mt-16 md:mt-24">
						<h2 className="text-[11px] tracking-[0.2em] text-fog-500 uppercase">
							Все публикации
						</h2>

						<div className="mt-6 border-t border-white/8">
							{[...otherPinned, ...rest].map((item, i) => (
								<Reveal
									key={item.id}
									delay={(i % 3) * 0.06}
									as="article"
									className="grid gap-5 border-b border-white/8 py-8 sm:grid-cols-12 sm:gap-8"
								>
									<div className="sm:col-span-4 lg:col-span-3">
										<Cover item={item} />
									</div>
									<div className="sm:col-span-8 lg:col-span-9">
										<div className="flex items-center gap-3">
											<time dateTime={item.date} className="tnum text-xs text-fog-500">
												{formatDate(item.date)}
											</time>
											{item.isPinned && (
												<span className="text-[11px] tracking-[0.16em] text-accent-200 uppercase">
													закреплено
												</span>
											)}
										</div>
										<h3 className="mt-3 max-w-3xl text-lg font-semibold text-fog-50 md:text-xl">
											{item.title}
										</h3>
										<div className="max-w-3xl">
											<ReadMore item={item} />
											<Tags tags={item.tags} />
											<Source item={item} />
										</div>
									</div>
								</Reveal>
							))}
						</div>
					</div>
				</div>

				<div className="h-20 md:h-28" />
			</main>
		</>
	);
}
