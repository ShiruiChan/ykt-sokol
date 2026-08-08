import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import { products } from '../data/products';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import Reveal from '../components/Reveal';
import {
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Check,
	ChevronDown,
	Image as ImageIcon,
	categoryIcon,
} from '../components/Icons';
import { sendRequest } from '../utils/emailjs';
import type { Accessory, Product } from '../types';

/* -------------------------------------------------------------------------- */
/*  Таблица характеристик: плоские данные раскладываем по инженерным группам   */
/* -------------------------------------------------------------------------- */

const SPEC_GROUPS: { title: string; rows: [string, (p: Product) => string | undefined][] }[] = [
	{
		title: 'Габариты и масса',
		rows: [
			['Габариты (Д×Ш×В)', (p) => p.specs.size],
			['Высота', (p) => p.specs.height],
			['Дорожный просвет', (p) => p.specs.clearance],
			['Колёсная формула', (p) => p.specs.extendedSpecs?.wheelFormula],
			['Снаряжённая масса', (p) => p.specs.extendedSpecs?.weight],
			['Полная масса', (p) => p.specs.extendedSpecs?.fullWeight],
			['Мест', (p) => p.specs.seats],
		],
	},
	{
		title: 'Двигатель и трансмиссия',
		rows: [
			['Двигатель', (p) => p.specs.engine],
			['Мощность', (p) => p.specs.extendedSpecs?.enginePower],
			['Крутящий момент', (p) => p.specs.extendedSpecs?.torque],
			['Коробка передач', (p) => p.specs.transmission],
			['Расход топлива', (p) => p.specs.fuelConsumption],
			['Максимальная скорость', (p) => p.specs.maxSpeed],
			['Скорость на плаву', (p) => p.specs.extendedSpecs?.waterSpeed],
		],
	},
	{
		title: 'Ходовая часть и тормоза',
		rows: [
			['Подвеска', (p) => p.specs.extendedSpecs?.suspension],
			['Рулевое управление', (p) => p.specs.extendedSpecs?.steering],
			['Тормозная система', (p) => p.specs.extendedSpecs?.brakeSystem],
			['Стояночный тормоз', (p) => p.specs.extendedSpecs?.parkingBrake],
		],
	},
	{
		title: 'Колёса и проходимость',
		rows: [
			['Шины', (p) => p.specs.extendedSpecs?.tires],
			['Давление в шинах', (p) => p.specs.extendedSpecs?.tirePressure],
			['Преодолеваемый подъём', (p) => p.specs.extendedSpecs?.slope],
			['Угол поперечной устойчивости', (p) => p.specs.extendedSpecs?.lateralStability],
		],
	},
];

/** «103 кВт / 140 л.с. (6400 об/мин)» → «140 л.с.» для плитки ключевых цифр */
function shortPower(value?: string) {
	if (!value) return undefined;
	return value.match(/\d[\d.,]*\s*л\.\s?с\./i)?.[0] ?? value.split('/')[0].trim();
}

/* ------------------------------ Галерея модели ----------------------------- */

function ProductGallery({ product }: { product: Product }) {
	const [index, setIndex] = useState(0);
	const reduce = useReducedMotion();
	const images = product.images ?? [];

	useEffect(() => setIndex(0), [product.id]);

	if (!images.length) {
		return (
			<div className="bezel">
				<div className="hatch grid aspect-[4/3] place-items-center rounded-[calc(2rem-0.375rem)] bg-ink-900 text-fog-500">
					<div className="text-center">
						<ImageIcon className="mx-auto h-10 w-10 opacity-60" />
						<p className="mt-3 text-xs tracking-[0.18em] uppercase">фотосъёмка готовится</p>
					</div>
				</div>
			</div>
		);
	}

	const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

	return (
		<div className="min-w-0">
			<PhotoProvider maskOpacity={0.94} bannerVisible={false}>
				<div className="bezel">
					<div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-ink-900">
						<PhotoView key={images[index]} src={images[index]}>
							<motion.img
								src={images[index]}
								alt={`${product.name} — фото ${index + 1} из ${images.length}`}
								className="aspect-[4/3] w-full cursor-zoom-in object-cover"
								initial={reduce ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
								fetchPriority={index === 0 ? 'high' : 'auto'}
								decoding="async"
							/>
						</PhotoView>

						{images.length > 1 && (
							<>
								<button
									type="button"
									onClick={() => go(-1)}
									aria-label="Предыдущее фото"
									className="absolute top-1/2 left-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-ink-950/55 text-fog-50 backdrop-blur transition hover:bg-ink-950/85"
								>
									<ArrowLeft className="h-5 w-5" />
								</button>
								<button
									type="button"
									onClick={() => go(1)}
									aria-label="Следующее фото"
									className="absolute top-1/2 right-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-ink-950/55 text-fog-50 backdrop-blur transition hover:bg-ink-950/85"
								>
									<ArrowRight className="h-5 w-5" />
								</button>
								<span className="tnum absolute bottom-4 left-4 rounded-full bg-ink-950/70 px-3 py-1 text-xs text-fog-200 backdrop-blur">
									{index + 1} / {images.length}
								</span>
							</>
						)}
					</div>
				</div>

				{/* Скрытые превью, чтобы лайтбокс листал всю серию */}
				<div className="hidden">
					{images.map((src, i) =>
						i === index ? null : (
							<PhotoView key={src} src={src}>
								<img src={src} alt="" />
							</PhotoView>
						)
					)}
				</div>
			</PhotoProvider>

			{images.length > 1 && (
				<div className="mt-3 flex min-w-0 gap-2 overflow-x-auto pb-1">
					{images.map((src, i) => (
						<button
							key={src}
							type="button"
							onClick={() => setIndex(i)}
							aria-label={`Показать фото ${i + 1}`}
							aria-current={i === index}
							className={`h-16 w-22 shrink-0 overflow-hidden rounded-xs border transition-all duration-300 ${
								i === index
									? 'border-accent-500'
									: 'border-white/10 opacity-55 hover:opacity-100'
							}`}
						>
							<img
								src={src}
								alt=""
								className="h-full w-full object-cover"
								loading="lazy"
								decoding="async"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

/* ------------------------------ Страница модели ---------------------------- */

export default function ProductPage() {
	const { id } = useParams<{ id: string }>();
	const product = products.find((p) => p.id === Number(id));

	const [selected, setSelected] = useState<Record<number, boolean>>({});
	const [openCategories, setOpenCategories] = useState<string[]>([]);
	const [openGroups, setOpenGroups] = useState<string[]>([SPEC_GROUPS[0].title]);
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
	const [showMobileBar, setShowMobileBar] = useState(false);

	const formRef = useRef<HTMLDivElement>(null);
	const emailFormRef = useRef<HTMLFormElement>(null);

	// Сброс выбора при переходе на другую модель
	useEffect(() => {
		setSelected({});
		setStatus('idle');
		setOpenCategories([]);
	}, [id]);

	// Одна подписка на скролл вместо четырёх конфликтующих
	useEffect(() => {
		const onScroll = () => {
			const rect = formRef.current?.getBoundingClientRect();
			const pastHero = window.scrollY > window.innerHeight * 0.5;
			const formVisible = rect ? rect.top < window.innerHeight && rect.bottom > 0 : false;
			setShowMobileBar(pastHero && !formVisible);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, []);

	const selectedList = useMemo<Accessory[]>(() => {
		if (!product) return [];
		return Object.values(product.accessories)
			.flat()
			.filter((acc) => selected[acc.id]);
	}, [product, selected]);

	const total = (product?.price ?? 0) + selectedList.reduce((sum, a) => sum + a.price, 0);

	if (!product) {
		return (
			<>
				<Header />
				<main id="main" className="section flex flex-1 items-center bg-ink-950">
					<div className="shell text-center">
						<p className="eyebrow justify-center">ошибка 404</p>
						<h1 className="mt-5 text-title text-fog-50">Такой модели нет</h1>
						<p className="mt-4 text-fog-400">Возможно, она снята с производства.</p>
						<Link to="/#catalog" className="btn btn-primary mt-8">
							Ко всем моделям
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</Link>
					</div>
				</main>
				<Footer />
			</>
		);
	}

	const toggleAccessory = (accId: number) =>
		setSelected((prev) => ({ ...prev, [accId]: !prev[accId] }));

	const toggleCategory = (name: string) =>
		setOpenCategories((prev) =>
			prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
		);

	const toggleGroup = (name: string) =>
		setOpenGroups((prev) =>
			prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
		);

	const scrollToForm = () =>
		formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const form = emailFormRef.current;
		if (!form) return;

		setStatus('sending');
		try {
			await sendRequest({
				from_name: (form.from_name as HTMLInputElement).value,
				contact: (form.contact as HTMLInputElement).value,
				comments: (form.comments as HTMLTextAreaElement).value || '—',
				product_name: product.name,
				product_price: product.price.toLocaleString('ru-RU'),
				accessories:
					selectedList.map((a) => `${a.name}: ${a.price.toLocaleString('ru-RU')} ₽`).join('\n') ||
					'Нет выбранных аксессуаров',
				total_price: total.toLocaleString('ru-RU'),
			});
			setStatus('sent');
			form.reset();
			setSelected({});
		} catch {
			setStatus('error');
		}
	};

	const others = products.filter((p) => p.id !== product.id).slice(0, 3);

	return (
		<>
			<Helmet>
				<title>{`${product.name} — снегоболотоход ЯКТ СОКОЛ`}</title>
				<meta name="description" content={product.deskSmall} />
			</Helmet>

			<Header />

			<main id="main" className="flex-1 bg-ink-950 pt-28 md:pt-32">
				{/* ---------------------------- Первый экран модели ---------------------------- */}
				<section className="shell">
					<Breadcrumbs currentPage={product.name} />

					<div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
						<div className="min-w-0 lg:col-span-7">
							<ProductGallery product={product} />
						</div>

						<div className="min-w-0 lg:col-span-5">
							<p className="eyebrow">
								<span className="h-px w-8 bg-accent-400/70" />
								снегоболотоход 4×4
							</p>
							<h1 className="mt-5 font-display text-title tracking-[0.01em] text-fog-50 uppercase">
								{product.name}
							</h1>

							<p className="mt-6 text-fog-400">{product.deskSmall}</p>

							{/* Ключевые цифры */}
							<dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/8 bg-white/8">
								{[
									{ k: 'Клиренс', v: product.specs.clearance },
									{ k: 'Мощность', v: shortPower(product.specs.extendedSpecs?.enginePower) },
									{ k: 'Мест', v: product.specs.seats },
									{ k: 'На плаву', v: product.specs.extendedSpecs?.waterSpeed },
								]
									.filter((x) => x.v)
									.map((x) => (
										<div key={x.k} className="bg-ink-900 px-4 py-4">
											<dt className="text-[11px] tracking-[0.14em] text-fog-500 uppercase">
												{x.k}
											</dt>
											<dd className="tnum mt-1.5 text-base font-semibold text-fog-50">{x.v}</dd>
										</div>
									))}
							</dl>

							{/* Цена и целевое действие */}
							<div className="mt-8 rounded-lg border border-white/8 bg-ink-850 p-6">
								<span className="text-[11px] tracking-[0.16em] text-fog-500 uppercase">
									базовая комплектация
								</span>
								<p className="tnum mt-2 text-3xl font-bold text-fog-50">
									{product.price.toLocaleString('ru-RU')} ₽
								</p>
								<p className="mt-2 text-sm text-fog-500">
									Цена с документами и ЗИП. Доставка по России — рассчитывается отдельно.
								</p>
								<button type="button" onClick={scrollToForm} className="btn btn-primary mt-6 w-full">
									Оставить заявку
									<span className="btn-dot">
										<ArrowUpRight className="h-4 w-4" />
									</span>
								</button>
								<a href="tel:+79969141414" className="btn btn-ghost mt-3 w-full">
									<span className="tnum">+7 (996) 914-14-14</span>
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* --------------------------------- Описание --------------------------------- */}
				<section className="section">
					<div className="shell grid gap-8 lg:grid-cols-12">
						<Reveal className="lg:col-span-4">
							<h2 className="text-heading text-fog-50">О модели</h2>
						</Reveal>
						<Reveal delay={0.08} className="lg:col-span-8">
							<p className="max-w-[68ch] text-lede text-fog-200">{product.description}</p>
						</Reveal>
					</div>
				</section>

				{/* ---------------------------- Технические данные ---------------------------- */}
				<section className="border-y border-white/8 bg-ink-900">
					<div className="section shell">
						<Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<p className="eyebrow">
									<span className="h-px w-8 bg-accent-400/70" />
									паспортные данные
								</p>
								<h2 className="mt-5 text-title text-fog-50">Характеристики</h2>
							</div>
							<button
								type="button"
								onClick={() =>
									setOpenGroups((prev) =>
										prev.length === SPEC_GROUPS.length
											? []
											: SPEC_GROUPS.map((g) => g.title)
									)
								}
								className="link-quiet self-start text-sm sm:self-auto"
							>
								{openGroups.length === SPEC_GROUPS.length ? 'Свернуть всё' : 'Раскрыть всё'}
							</button>
						</Reveal>

						<div className="mt-10 overflow-hidden rounded-lg border border-white/8 bg-ink-850 md:mt-12">
							{SPEC_GROUPS.map((group) => {
								const rows = group.rows
									.map(([label, get]) => [label, get(product)] as const)
									.filter(([, value]) => Boolean(value));
								if (!rows.length) return null;

								const isOpen = openGroups.includes(group.title);

								return (
									<div key={group.title} className="border-t border-white/8 first:border-t-0">
										<button
											type="button"
											onClick={() => toggleGroup(group.title)}
											aria-expanded={isOpen}
											className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/3 md:px-8"
										>
											<span className="flex items-baseline gap-4">
												<span className="text-base font-semibold text-fog-50 md:text-lg">
													{group.title}
												</span>
												<span className="tnum text-xs text-fog-500">{rows.length}</span>
											</span>
											<ChevronDown
												className={`h-5 w-5 shrink-0 text-fog-400 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
													isOpen ? 'rotate-180' : ''
												}`}
											/>
										</button>

										<AnimatePresence initial={false}>
											{isOpen && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: 'auto', opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
													className="overflow-hidden"
												>
													<div className="px-5 pb-6 md:px-8">
														{rows.map(([label, value]) => (
															<div key={label} className="spec-row">
																<span className="spec-key">{label}</span>
																<span className="spec-val">{value}</span>
															</div>
														))}
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								);
							})}
						</div>

						{/* Комплект поставки */}
						<Reveal className="mt-12 grid gap-8 lg:grid-cols-12">
							<div className="lg:col-span-4">
								<h3 className="text-heading text-fog-50">Комплект поставки</h3>
								<p className="mt-3 text-sm text-fog-400">
									Входит в базовую цену, ничего докупать не нужно.
								</p>
							</div>
							<ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:col-span-8">
								{product.defaultKit.map((item) => (
									<li
										key={item.name}
										className="flex items-baseline justify-between gap-4 border-b border-white/7 pb-3 text-sm"
									>
										<span className="text-fog-200">{item.name}</span>
										<span className="tnum shrink-0 text-fog-500">{item.quantity}</span>
									</li>
								))}
							</ul>
						</Reveal>
					</div>
				</section>

				{/* ------------------------------- Аксессуары -------------------------------- */}
				<section className="section shell">
					<Reveal>
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							дооснащение
						</p>
						<h2 className="mt-5 text-title text-fog-50">Соберите свою комплектацию</h2>
						<p className="mt-5 max-w-xl text-fog-400">
							Отметьте нужное — сумма пересчитается, и мы получим её вместе с заявкой.
						</p>
					</Reveal>

					<div className="mt-10 space-y-3 md:mt-12">
						{Object.entries(product.accessories).map(([category, items]) => {
							const Icon = categoryIcon(category);
							const isOpen = openCategories.includes(category);
							const chosen = items.filter((a) => selected[a.id]).length;

							return (
								<div
									key={category}
									className="overflow-hidden rounded-lg border border-white/8 bg-ink-850"
								>
									<button
										type="button"
										onClick={() => toggleCategory(category)}
										aria-expanded={isOpen}
										className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-white/3 md:px-7"
									>
										<Icon className="h-6 w-6 shrink-0 text-accent-200" />
										<span className="flex-1 font-semibold text-fog-50">{category}</span>
										{chosen > 0 && (
											<span className="tnum rounded-full bg-accent-900 px-2.5 py-1 text-xs font-semibold text-accent-200">
												выбрано {chosen}
											</span>
										)}
										<span className="tnum hidden text-xs text-fog-500 sm:inline">
											{items.length} поз.
										</span>
										<ChevronDown
											className={`h-5 w-5 shrink-0 text-fog-400 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
												isOpen ? 'rotate-180' : ''
											}`}
										/>
									</button>

									<AnimatePresence initial={false}>
										{isOpen && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: 'auto', opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
												className="overflow-hidden"
											>
												<div className="grid gap-3 px-5 pb-6 sm:grid-cols-2 md:px-7 lg:grid-cols-3">
													{items.map((acc) => {
														const isSelected = Boolean(selected[acc.id]);
														return (
															<button
																key={acc.id}
																type="button"
																onClick={() => toggleAccessory(acc.id)}
																aria-pressed={isSelected}
																className={`relative flex flex-col rounded-md border p-5 pr-12 text-left transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
																	isSelected
																		? 'border-accent-500/60 bg-accent-900/35'
																		: 'border-white/8 bg-ink-800 hover:border-white/20'
																}`}
															>
																<span className="text-sm font-semibold text-fog-50">
																	{acc.name}
																</span>
																<span className="mt-1.5 flex-1 text-xs leading-relaxed text-fog-500">
																	{acc.description}
																</span>
																<span className="tnum mt-4 text-sm font-bold text-fog-200">
																	+{acc.price.toLocaleString('ru-RU')} ₽
																</span>

																<span
																	className={`absolute top-4 right-4 grid h-6 w-6 place-items-center rounded-full border transition-colors duration-300 ${
																		isSelected
																			? 'border-accent-500 bg-accent-500 text-white'
																			: 'border-white/20 text-transparent'
																	}`}
																>
																	<Check className="h-3.5 w-3.5" />
																</span>
															</button>
														);
													})}
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							);
						})}
					</div>
				</section>

				{/* --------------------------- Заявка + смета -------------------------------- */}
				<section className="border-t border-white/8 bg-ink-900">
					<div className="section shell">
						<div ref={formRef} id="form-section" className="grid gap-8 lg:grid-cols-12 lg:gap-12">
							<div className="min-w-0 lg:col-span-7">
								<p className="eyebrow">
									<span className="h-px w-8 bg-accent-400/70" />
									шаг последний
								</p>
								<h2 className="mt-5 text-title text-fog-50">Оформить заявку</h2>
								<p className="mt-5 max-w-lg text-fog-400">
									Инженер перезвонит, уточнит комплектацию и назовёт срок изготовления.
									Предоплата не требуется до согласования.
								</p>

								{status === 'sent' ? (
									<div className="animate-fadeIn mt-9 rounded-lg border border-accent-500/30 bg-accent-900/40 p-8">
										<div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-500 text-white">
											<Check className="h-6 w-6" />
										</div>
										<p className="text-lg font-semibold text-fog-50">Заявка принята</p>
										<p className="mt-2 text-sm text-fog-400">
											Перезвоним в рабочее время — с 9:00 до 18:00 по Якутску.
										</p>
										<button
											type="button"
											onClick={() => setStatus('idle')}
											className="link-quiet mt-6"
										>
											Отправить ещё одну
										</button>
									</div>
								) : (
									<form
										ref={emailFormRef}
										onSubmit={handleSubmit}
										className="mt-9 space-y-5 rounded-lg border border-white/8 bg-ink-850 p-6 md:p-8"
									>
										<div className="grid gap-5 sm:grid-cols-2">
											<div>
												<label htmlFor="pp-name" className="field-label">
													ФИО
												</label>
												<input
													id="pp-name"
													type="text"
													name="from_name"
													autoComplete="name"
													placeholder="Айсен Николаев"
													className="field"
													required
												/>
											</div>
											<div>
												<label htmlFor="pp-contact" className="field-label">
													Телефон
												</label>
												<input
													id="pp-contact"
													type="tel"
													name="contact"
													inputMode="tel"
													autoComplete="tel"
													placeholder="+7 (914) 276-75-20"
													className="field tnum"
													required
												/>
											</div>
										</div>
										<div>
											<label htmlFor="pp-comments" className="field-label">
												Комментарий
												<span className="ml-2 font-normal tracking-normal text-fog-500">
													необязательно
												</span>
											</label>
											<textarea
												id="pp-comments"
												name="comments"
												rows={4}
												placeholder="Сроки, доставка, дополнительные пожелания"
												className="field resize-none"
											/>
										</div>

										{status === 'error' && (
											<p className="rounded-sm border border-[#a8543f]/50 bg-[#2a1512] px-4 py-3 text-sm text-[#e5a894]">
												Не удалось отправить заявку. Попробуйте ещё раз или позвоните:{' '}
												<a href="tel:+79969141414" className="underline">
													+7 (996) 914-14-14
												</a>
											</p>
										)}

										<button
											type="submit"
											disabled={status === 'sending'}
											className="btn btn-primary w-full sm:w-auto"
										>
											{status === 'sending' ? 'Отправляем…' : 'Отправить заявку'}
											<span className="btn-dot">
												<ArrowUpRight className="h-4 w-4" />
											</span>
										</button>

										<p className="text-xs leading-relaxed text-fog-500">
											Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
										</p>
									</form>
								)}
							</div>

							{/* Смета */}
							<aside className="min-w-0 lg:col-span-5">
								<div className="sticky top-28 rounded-lg border border-white/8 bg-ink-850 p-6">
									<h3 className="text-[11px] tracking-[0.2em] text-fog-500 uppercase">
										ваша конфигурация
									</h3>

									<div className="mt-5 flex items-center gap-3 border-b border-white/8 pb-5">
										{product.images?.[0] ? (
											<img
												src={product.images[0]}
												alt=""
												className="h-14 w-14 shrink-0 rounded-xs object-cover"
												loading="lazy"
												decoding="async"
											/>
										) : (
											<span className="hatch grid h-14 w-14 shrink-0 place-items-center rounded-xs bg-ink-800">
												<ImageIcon className="h-5 w-5 text-fog-500" />
											</span>
										)}
										<div className="min-w-0">
											<p className="truncate font-display text-sm tracking-wide text-fog-50 uppercase">
												{product.name}
											</p>
											<p className="tnum mt-1 text-sm font-semibold text-fog-200">
												{product.price.toLocaleString('ru-RU')} ₽
											</p>
										</div>
									</div>

									{selectedList.length > 0 ? (
										<ul className="mt-5 space-y-2.5">
											{selectedList.map((acc) => (
												<li key={acc.id} className="flex justify-between gap-4 text-sm">
													<span className="text-fog-400">{acc.name}</span>
													<span className="tnum shrink-0 text-fog-200">
														{acc.price.toLocaleString('ru-RU')} ₽
													</span>
												</li>
											))}
										</ul>
									) : (
										<p className="mt-5 text-sm text-fog-500">
											Базовая комплектация. Аксессуары можно добавить выше.
										</p>
									)}

									<div className="mt-6 flex items-baseline justify-between border-t border-white/8 pt-5">
										<span className="text-sm text-fog-400">Итого</span>
										<span className="tnum text-2xl font-bold text-fog-50">
											{total.toLocaleString('ru-RU')} ₽
										</span>
									</div>
								</div>
							</aside>
						</div>
					</div>
				</section>

				{/* ------------------------------ Другие модели ------------------------------ */}
				<section className="section shell">
					<Reveal className="flex items-end justify-between gap-6">
						<h2 className="text-heading text-fog-50">Другие модели</h2>
						<Link to="/#catalog" className="link-quiet shrink-0 text-sm">
							Вся линейка
							<ArrowUpRight className="h-4 w-4" />
						</Link>
					</Reveal>

					<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{others.map((p, i) => (
							<Reveal key={p.id} delay={i * 0.07}>
								<Link
									to={`/product/${p.id}`}
									className="group block overflow-hidden rounded-lg border border-white/7 bg-ink-850 transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-white/16"
								>
									<div className="relative aspect-[4/3] overflow-hidden bg-ink-900">
										{p.images?.[0] ? (
											<img
												src={p.images[0]}
												alt={`Снегоболотоход ${p.name}`}
												className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
												loading="lazy"
												decoding="async"
											/>
										) : (
											<div className="hatch grid h-full place-items-center">
												<ImageIcon className="h-8 w-8 text-fog-500" />
											</div>
										)}
									</div>
									<div className="flex items-center justify-between gap-4 p-5">
										<div className="min-w-0">
											<p className="truncate font-display text-base tracking-wide text-fog-50 uppercase">
												{p.name}
											</p>
											<p className="tnum mt-1 text-sm text-fog-400">
												{p.price.toLocaleString('ru-RU')} ₽
											</p>
										</div>
										<span className="btn-dot bg-white/8 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
											<ArrowUpRight className="h-4 w-4 text-fog-50" />
										</span>
									</div>
								</Link>
							</Reveal>
						))}
					</div>
				</section>
			</main>

			{/* Мобильная панель со сметой и переходом к форме */}
			<AnimatePresence>
				{showMobileBar && (
					<motion.div
						initial={{ y: 80 }}
						animate={{ y: 0 }}
						exit={{ y: 80 }}
						transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
						className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/92 px-4 py-3 backdrop-blur-xl lg:hidden"
					>
						<div className="flex items-center justify-between gap-4">
							<div className="min-w-0">
								<p className="text-[11px] tracking-[0.14em] text-fog-500 uppercase">
									итого{selectedList.length > 0 ? ` · +${selectedList.length}` : ''}
								</p>
								<p className="tnum truncate text-lg font-bold text-fog-50">
									{total.toLocaleString('ru-RU')} ₽
								</p>
							</div>
							<button
								type="button"
								onClick={scrollToForm}
								className="btn btn-primary shrink-0 py-3 pr-3 pl-5 text-sm"
							>
								Оформить
								<span className="btn-dot h-7 w-7">
									<ArrowUpRight className="h-3.5 w-3.5" />
								</span>
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<Footer />
		</>
	);
}
