import Reveal from './Reveal';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Clock, Phone, Pin } from './Icons';

/**
 * Блок «Контакты и производство». Карта оставлена прежним виджетом-iframe —
 * менялась только оправа и раскладка (текст слева, карта справа).
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
										г. Якутск, ул. Чусовского, 75/3
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
										href="tel:+79969141414"
										className="tnum mt-1 block text-lg font-semibold text-fog-50 transition-colors hover:text-accent-200"
									>
										+7 (996) 914-14-14
									</a>
								</div>
							</li>
							<li className="flex items-start gap-4">
								<Clock className="mt-1 h-5 w-5 shrink-0 text-accent-200" />
								<div>
									<span className="block text-[11px] tracking-[0.16em] text-fog-500 uppercase">
										часы работы
									</span>
									<span className="mt-1 block text-fog-50">Ежедневно, 9:00–18:00</span>
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
						<div className="h-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-ink-900">
{/* Светлый виджет карты на тёмной странице выглядит инородно —
							    приводим его к тёмной теме инверсией с возвратом оттенков. */}
							<iframe
								src="https://yandex.ru/map-widget/v1/?um=constructor%3A254de833350520bd7e4f5e1bfc20d3607f3b01fac102f13db1df68fc1696db89&amp;source=constructor"
								title="Карта проезда к производству ЯКТ СОКОЛ, Якутск, Чусовского 75/3"
								loading="lazy"
								allowFullScreen
								className="h-[340px] w-full border-0 md:h-full md:min-h-[460px]"
								style={{ filter: 'invert(0.92) hue-rotate(180deg) saturate(0.72) contrast(0.92)' }}
							/>
						</div>
					</Reveal>
				</div>
			</div>
		</section>
	);
}
