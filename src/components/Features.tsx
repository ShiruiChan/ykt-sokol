import { lazy, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Certificate, Frame, Frost, Plant, Tire, Wrench } from './Icons';
import SplitText from '../motion/SplitText';
import CountUp from '../motion/CountUp';
import { useAfterLoad } from '../motion/useAfterLoad';
import { useMagnetic } from '../motion/useMagnetic';

const FeaturesScene = lazy(() => import('../motion/scenes/FeaturesScene'));

/**
 * Асимметричный бенто вместо трёх одинаковых колонок.
 * Крупная плитка с кадром техники держит композицию, остальные,
 * короткие доводы. Иконки собственные, тонкие, одной толщины линии.
 */
const POINTS = [
	{
		icon: Frost,
		title: 'Держит мороз',
		text: 'Проводка, уплотнители и рабочие жидкости подобраны под якутскую зиму. Машина заводится и едет при −50 °C.',
	},
	{
		icon: Frame,
		title: 'Сварная рама',
		text: 'Пространственная рама из профильной трубы, зависимые мосты УАЗ «Тимкен» и Спайсер с блокировкой.',
	},
	{
		icon: Wrench,
		title: 'Чинится в поле',
		text: 'Узлы Toyota и УАЗ: запчасти есть в любом райцентре. Ремонт не требует фирменного сервиса.',
	},
	{
		icon: Certificate,
		title: 'С документами',
		text: 'Электронный ПСМ, паспорт изделия и сервисная книжка. Техника ставится на учёт как самоходная машина.',
	},
];

export default function Features() {
	const openRequest = useRequestModal((s) => s.open);
	const ref = useRef<HTMLElement>(null);
	const sceneReady = useAfterLoad();
	const ctaRef = useMagnetic<HTMLButtonElement>();

	return (
		<section ref={ref} className="section relative bg-ink-950">
			{sceneReady && (
				<Suspense fallback={null}>
					<FeaturesScene scope={ref} />
				</Suspense>
			)}

			<div className="shell">
				<div className="grid gap-10 lg:grid-cols-12 lg:gap-12" data-feat-stage>
					<Reveal className="lg:col-span-5">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							Почему берут СОКОЛ
						</p>
						<SplitText
							as="h2"
							className="mt-5 text-title text-fog-50"
							lines={[
								{ text: 'Техника, собранная теми,' },
								{ text: 'кто сам по ней ездит', className: 'sm:block' },
							]}
						/>
						<p className="mt-6 max-w-md text-fog-400">
							Мы производим снегоболотоходы в Якутске и испытываем их здесь же: на реке, в
							тайге и на зимниках. Всё, что не выдерживает, до серии не доходит.
						</p>

						<div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
							<div>
								<CountUp
									value="288"
									className="tnum font-display text-4xl leading-none text-fog-50"
								/>
								<span className="mt-1.5 block text-xs text-fog-500">
									машин отгружено одной партией
								</span>
							</div>
							<div className="hidden h-10 w-px bg-white/10 sm:block" />
							<div>
								<CountUp
									value="6"
									className="tnum font-display text-4xl leading-none text-fog-50"
								/>
								<span className="mt-1.5 block text-xs text-fog-500">моделей в линейке</span>
							</div>
						</div>

						<button
							ref={ctaRef}
							type="button"
							onClick={() => openRequest()}
							className="btn btn-ghost mt-9"
						>
							Обсудить задачу
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</button>
					</Reveal>

					{/* Правая часть: крупный кадр + сетка доводов */}
					<div className="lg:col-span-7">
						<Reveal delay={0.08} className="bezel">
							<figure className="relative overflow-hidden rounded-[calc(2rem-0.375rem)]">
								<img
									src="/images/lis/1.webp"
									alt="Снегоболотоход СОКОЛ ЛИС на грунтовой дороге в сосновом лесу"
									className="aspect-[16/10] w-full object-cover"
									loading="lazy"
									decoding="async"
									width={1024}
									height={640}
								/>
								<div
									aria-hidden
									className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,10,0.92)_0%,transparent_55%)]"
								/>
								<figcaption className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-4">
									<span className="font-display text-lg tracking-wide text-fog-50 uppercase">
										СОКОЛ ЛИС
									</span>
									<span className="flex items-center gap-2 text-xs text-fog-400">
										<Tire className="h-4 w-4 text-accent-200" />
										шины низкого давления 1300×700
									</span>
								</figcaption>
							</figure>
						</Reveal>

						{/* На широком экране сцена складывает доводы в «колоду» (data-scene="on") */}
						<div className="feat-deck mt-6 grid gap-4 sm:grid-cols-2" data-feat-deck>
							{POINTS.map((p) => {
								const Icon = p.icon;
								return (
									<article
										key={p.title}
										data-feat-card
										className="group rounded-lg border border-white/7 bg-ink-850 p-6 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent-500/35 hover:bg-ink-800"
									>
										<Icon className="h-7 w-7 text-accent-200 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5" />
										<h3 className="mt-5 text-lg font-semibold text-fog-50">{p.title}</h3>
										<p className="mt-2 text-sm leading-relaxed text-fog-400">{p.text}</p>
									</article>
								);
							})}
						</div>

						{/* Счётчик и прогресс колоды: декоративные, видны только в режиме сцены */}
						<div aria-hidden className="feat-deck-meta mt-5 items-center gap-4">
							<span className="tnum font-display text-sm tracking-[0.12em] text-fog-50">
								<span data-feat-counter>01</span>
								<span className="text-fog-500"> / {String(POINTS.length).padStart(2, '0')}</span>
							</span>
							<span className="relative h-px flex-1 overflow-hidden bg-white/10">
								<span
									data-feat-progress
									className="absolute inset-0 origin-left scale-x-25 bg-accent-400"
								/>
							</span>
						</div>
					</div>
				</div>

				{/* Производственная строка */}
				<Reveal
					delay={0.1}
					className="mt-14 flex flex-col gap-5 rounded-lg border border-white/7 bg-ink-900 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:mt-20 md:px-8"
				>
					<div className="flex items-start gap-4">
						<Plant className="mt-0.5 h-8 w-8 shrink-0 text-accent-200" />
						<div>
							<p className="font-semibold text-fog-50">Собственный цех в Якутске</p>
							<p className="mt-1 text-sm text-fog-400">
								Резка, сварка рам, сборка и обкатка на одной площадке на Чусовского, 75/3.
							</p>
						</div>
					</div>
					<Link to="/cert" className="link-quiet shrink-0">
						Сертификаты и ПСМ
						<ArrowUpRight className="h-4 w-4" />
					</Link>
				</Reveal>
			</div>
		</section>
	);
}
