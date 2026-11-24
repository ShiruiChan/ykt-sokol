import Reveal from './Reveal';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Clock, Phone, Pin } from './Icons';
import { ADDRESS, HOURS, PHONE } from '../config/site';

/** Точка цеха — та же, что в scripts/build-contact-map.mjs (центр картинки карты) */
const YANDEX_MAPS_URL = 'https://yandex.ru/maps/?pt=129.729977,62.06665&z=17&l=map';

/**
 * Блок «Контакты и производство»: текст слева, карта справа.
 */
export default function DynamicYandexMap() {
	const openRequest = useRequestModal((s) => s.open);

	return (
		<section className="section bg-ink-950">
			<div className="shell">
				<div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
					<Reveal className="lg:col-span-5">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							Контакты
						</p>
						<h2 className="mt-5 text-title text-fog-50">Приезжайте в цех</h2>
						<p className="mt-6 max-w-md text-fog-400">
							Машину можно осмотреть и проехать на ней до покупки. Заранее позвоните —
							подготовим нужную модель.
						</p>

						<ul className="mt-9 space-y-6">
							<li className="flex items-start gap-4">
								<Pin className="mt-1 h-5 w-5 shrink-0 text-accent-200" />
								<div>
									<span className="block text-[11px] tracking-[0.16em] text-fog-500 uppercase">
										адрес
									</span>
									<span className="mt-1 block text-fog-50">
										{ADDRESS.full}
									</span>
								</div>
							</li>
							<li className="flex items-start gap-4">
								<Phone className="mt-1 h-5 w-5 shrink-0 text-accent-200" />
								<div>
									<span className="block text-[11px] tracking-[0.16em] text-fog-500 uppercase">
										телефон
									</span>
									<a
										href={PHONE.href}
										className="tnum mt-1 block text-lg font-semibold text-fog-50 transition-colors hover:text-accent-200"
									>
										{PHONE.label}
									</a>
								</div>
							</li>
							<li className="flex items-start gap-4">
								<Clock className="mt-1 h-5 w-5 shrink-0 text-accent-200" />
								<div>
									<span className="block text-[11px] tracking-[0.16em] text-fog-500 uppercase">
										часы работы
									</span>
									<span className="mt-1 block text-fog-50">{HOURS.label}</span>
								</div>
							</li>
						</ul>

						<button type="button" onClick={() => openRequest()} className="btn btn-primary mt-10">
							Записаться на просмотр
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</button>
					</Reveal>

					<Reveal delay={0.1} className="bezel lg:col-span-7">
						{/* Своя карта-картинка (scripts/build-contact-map.mjs) вместо виджета Яндекса:
						    в виджет Яндекс подставлял рекламу чужих вездеходов. Цех — ровно в центре кадра. */}
						<div className="relative h-[340px] overflow-hidden rounded-[calc(2rem-0.375rem)] bg-ink-900 md:h-full md:min-h-[460px]">
							<img
								src="/images/map/contacts.svg"
								alt={`Схема проезда к производству ЯКТСокол: ${ADDRESS.full}`}
								className="absolute inset-0 h-full w-full object-cover"
								loading="lazy"
								decoding="async"
								width={1200}
								height={800}
							/>

							{/* Метка: остриё в центре кадра */}
							<div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
								<div className="mb-2 rounded-full border border-white/10 bg-ink-950/90 px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-fog-50 shadow-lg backdrop-blur-sm">
									ЯКТСокол · цех
								</div>
								<svg viewBox="0 0 28 38" className="mx-auto h-10 w-[30px] drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]">
									<path
										d="M14 37C14 37 27 22.6 27 13.8 27 6.4 21.2 1 14 1S1 6.4 1 13.8C1 22.6 14 37 14 37Z"
										fill="var(--color-accent-500)"
										stroke="var(--color-accent-200)"
										strokeWidth="1.5"
									/>
									<circle cx="14" cy="13.5" r="5" fill="var(--color-ink-950)" />
								</svg>
							</div>

							<div className="absolute right-3 bottom-3 left-3 flex flex-wrap items-end justify-between gap-2">
								<div className="flex flex-wrap gap-2">
									<a
										href={YANDEX_MAPS_URL}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/90 px-3.5 py-2 text-sm text-fog-50 backdrop-blur-sm transition-colors hover:border-accent-500/50 hover:text-accent-200"
									>
										Яндекс Карты
										<ArrowUpRight className="h-3.5 w-3.5" />
									</a>
									<a
										href={ADDRESS.routeUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/90 px-3.5 py-2 text-sm text-fog-50 backdrop-blur-sm transition-colors hover:border-accent-500/50 hover:text-accent-200"
									>
										2ГИС
										<ArrowUpRight className="h-3.5 w-3.5" />
									</a>
								</div>
								<a
									href="https://www.openstreetmap.org/copyright"
									target="_blank"
									rel="noopener noreferrer"
									className="rounded bg-ink-950/70 px-1.5 py-0.5 text-[10px] text-fog-500 hover:text-fog-200"
								>
									© участники OpenStreetMap
								</a>
							</div>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
