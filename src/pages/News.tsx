import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { newsList } from '../data/news';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Reveal from '../components/Reveal';
import SmartImage from '../components/SmartImage';
import { ChevronDown } from '../components/Icons';
import type { NewsItem } from '../types';

const formatDate = (iso: string) =>
	new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

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
			<Helmet>
				<title>Новости ЯКТ СОКОЛ</title>
				<meta
					name="description"
					content="Новости производства снегоболотоходов СОКОЛ в Якутске: поставки, испытания, награды и упоминания в прессе."
				/>
			</Helmet>

			<Header />

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
									<SmartImage
										src={lead.image}
										alt={lead.title}
										className="aspect-[16/10] w-full rounded-[calc(2rem-0.375rem)] object-cover"
										wrapperClassName="aspect-[16/10] w-full rounded-[calc(2rem-0.375rem)]"
									/>
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
										<SmartImage
											src={item.image}
											alt={item.title}
											className="aspect-[4/3] w-full rounded-md border border-white/7 object-cover"
											wrapperClassName="aspect-[4/3] w-full rounded-md border border-white/7"
										/>
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
										</div>
									</div>
								</Reveal>
							))}
						</div>
					</div>
				</div>

				<div className="h-20 md:h-28" />
			</main>

			<Footer />
		</>
	);
}
