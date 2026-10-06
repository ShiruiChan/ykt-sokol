import Reveal from './Reveal';
import { useRequestModal } from './RequestModal';
import { ArrowUpRight, Phone } from './Icons';

/**
 * Путь покупки в четыре шага. Снимает главный вопрос «а как это вообще
 * происходит» и показывает, что деньги вперёд никто не просит.
 */
const STEPS = [
	{
		title: 'Заявка или звонок',
		text: 'Расскажите, где будете ездить и что возить. Ответим в тот же день.',
	},
	{
		title: 'Подбор комплектации',
		text: 'Инженер предложит модель, шины и дооснащение, назовёт цену и срок изготовления.',
	},
	{
		title: 'Осмотр и тест-драйв',
		text: 'Приезжайте в цех на Чусовского, 75/3: машину можно осмотреть и проехать до покупки.',
	},
	{
		title: 'Документы и доставка',
		text: 'Передаём технику с ЭПСМ, паспортом и сервисной книжкой. Отправим в любой регион России.',
	},
];

export default function BuySteps() {
	const openRequest = useRequestModal((s) => s.open);

	return (
		<section className="section bg-ink-950">
			<div className="shell">
				<Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							Как купить
						</p>
						<h2 className="mt-5 text-title text-fog-50">От звонка до выезда</h2>
					</div>
					<p className="max-w-sm text-fog-400 md:text-right">
						Предоплата не нужна, пока вы не согласовали комплектацию и сроки.
					</p>
				</Reveal>

				<ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
					{STEPS.map((step, i) => (
						<Reveal
							key={step.title}
							as="li"
							delay={i * 0.07}
							className="relative bg-ink-900 p-6 md:p-7"
						>
							<span className="tnum font-display text-4xl leading-none text-accent-200/90">
								0{i + 1}
							</span>
							<h3 className="mt-6 text-lg font-semibold text-fog-50">{step.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-fog-400">{step.text}</p>
						</Reveal>
					))}
				</ol>

				<Reveal
					delay={0.1}
					className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
				>
					<button type="button" onClick={() => openRequest()} className="btn btn-primary">
						Начать с заявки
						<span className="btn-dot">
							<ArrowUpRight className="h-4 w-4" />
						</span>
					</button>
					<a href="tel:+79969141414" className="btn btn-ghost">
						<Phone className="h-4 w-4 text-accent-400" />
						<span className="tnum">+7 (996) 914-14-14</span>
					</a>
				</Reveal>
			</div>
		</section>
	);
}
