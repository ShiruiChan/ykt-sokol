import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import Faq from '../components/Faq';
import { useRequestModal } from '../components/RequestModal';
import { ArrowUpRight, Cargo, Certificate, Wrench } from '../components/Icons';
import { FAQ } from '../data/faq';
import { ADDRESS, PHONE } from '../config/site';

/** Иконка оплаты — в общем наборе такой нет, рисуем в той же манере (stroke 1.25) */
const Payment = (p: SVGProps<SVGSVGElement>) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={1.25}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden
		focusable={false}
		{...p}
	>
		<rect x="3" y="5.5" width="18" height="13" rx="2" />
		<path d="M3 9.5h18M7 14.5h4" />
	</svg>
);

/**
 * Шаги покупки. Порядок и «без предоплаты до согласования» —
 * как в форме заявки на странице модели.
 */
const STEPS = [
	{
		title: 'Заявка',
		text: 'По телефону, в мессенджере или через форму на сайте. Достаточно имени и номера.',
	},
	{
		title: 'Разговор с инженером',
		text: 'Перезвонит инженер: спросит, где и как будете ездить, и предложит модель.',
	},
	{
		title: 'Комплектация',
		text: 'Согласуем дооснащение, итоговую цену и срок изготовления. До этого момента предоплата не нужна.',
	},
	{
		title: 'Изготовление',
		text: 'Резка, сварка рамы, сборка и обкатка — в собственном цехе в Якутске.',
	},
	{
		title: 'Выдача или отгрузка',
		text: 'Забираете машину в цехе или отправляем её к вам. Вместе с машиной — документы и комплект ЗИП.',
	},
];

type Block = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	title: string;
	body: ReactNode;
};

const BLOCKS: Block[] = [
	{
		icon: Cargo,
		title: 'Доставка',
		body: (
			<>
				<p>
					Отправляем по Якутии и по всей России. Стоимость зависит от маршрута и способа
					перевозки, поэтому считаем её отдельно — назовём при заявке.
				</p>
				<p>
					Можно забрать машину самому: цех находится в Якутске, {ADDRESS.short}. Для перевозки
					по дорогам общего пользования есть одноосный прицеп — его можно заказать вместе с
					машиной.
				</p>
			</>
		),
	},
	{
		icon: Certificate,
		title: 'Документы и учёт',
		body: (
			<>
				<p>
					С машиной вы получаете электронный паспорт самоходной машины (ЭПСМ), паспорт изделия,
					сервисную книжку и руководство по эксплуатации. Техника ставится на учёт как
					самоходная машина.
				</p>
				<p>
					<Link to="/cert" className="link-quiet">
						Сертификаты и одобрение типа
						<ArrowUpRight className="h-4 w-4" />
					</Link>
				</p>
			</>
		),
	},
	{
		icon: Wrench,
		title: 'Гарантия и обслуживание',
		body: (
			<>
				<p>
					Машины собраны на узлах Toyota и УАЗ. Запчасти к ним продаются в любом райцентре, а
					ремонт не требует фирменного сервиса. Комплект ЗИП
					входит в поставку.
				</p>
				{/* TODO владельцу: срок гарантии и что она покрывает — заменить фразу ниже на конкретику */}
				<p>
					Условия гарантии записаны в паспорте изделия и сервисной книжке. Назовём их при
					заявке, до оплаты.
				</p>
			</>
		),
	},
	{
		icon: Payment,
		title: 'Оплата',
		body: (
			<>
				<p>
					Продаём частным лицам и организациям. Платите после того, как согласовали
					комплектацию, цену и срок.
				</p>
				{/* TODO владельцу: способы оплаты (наличные, карта, безнал, рассрочка/лизинг — если есть) */}
				<p>
					Для организаций подготовим счёт и спецификацию, копии документов вышлем по
					запросу.
				</p>
			</>
		),
	},
];

export default function Service() {
	const openRequest = useRequestModal((s) => s.open);

	return (
		<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
			<div className="shell">
				<Reveal className="max-w-2xl">
					<p className="eyebrow">
						<span className="h-px w-8 bg-accent-400/70" />
						покупка и сервис
					</p>
					<h1 className="mt-5 text-title text-fog-50">Как купить СОКОЛ</h1>
					<p className="mt-5 text-lede text-fog-400">
						От звонка до выдачи — пять шагов. Платить до согласования комплектации не нужно.
					</p>
				</Reveal>

				{/* Шаги: нумерованный список, на широком экране — в одну линию */}
				<section aria-labelledby="steps" className="mt-14 md:mt-20">
					<h2 id="steps" className="sr-only">
						Шаги покупки
					</h2>
					<ol className="grid gap-px overflow-hidden rounded-lg border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-5">
						{STEPS.map((s, i) => (
							<Reveal
								key={s.title}
								as="li"
								delay={0.06 * i}
								className="flex flex-col bg-ink-900 p-6 sm:last:col-span-2 md:p-7 lg:last:col-span-1"
							>
								<span className="tnum font-display text-4xl leading-none text-accent-200">
									{String(i + 1).padStart(2, '0')}
								</span>
								<h3 className="mt-5 text-lg font-semibold text-fog-50">{s.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-fog-400">{s.text}</p>
							</Reveal>
						))}
					</ol>
				</section>

				{/* Доставка, документы, гарантия, оплата */}
				<div className="mt-16 grid gap-5 md:mt-24 md:grid-cols-2">
					{BLOCKS.map((b, i) => {
						const Icon = b.icon;
						return (
							<Reveal
								key={b.title}
								as="section"
								delay={(i % 2) * 0.07}
								className="rounded-lg border border-white/7 bg-ink-850 p-6 md:p-8"
							>
								<Icon className="h-7 w-7 text-accent-200" />
								<h2 className="mt-5 text-heading text-fog-50">{b.title}</h2>
								<div className="mt-4 space-y-3 text-sm leading-relaxed text-fog-400 md:text-base">
									{b.body}
								</div>
							</Reveal>
						);
					})}
				</div>

				{/* Вопросы */}
				<section aria-labelledby="faq" className="mt-20 grid gap-10 md:mt-28 lg:grid-cols-12 lg:gap-12">
					<Reveal className="lg:col-span-4">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							вопросы
						</p>
						<h2 id="faq" className="mt-5 text-title text-fog-50">
							Что спрашивают чаще всего
						</h2>
						<p className="mt-5 max-w-sm text-fog-400">
							Не нашли ответа — позвоните{' '}
							<a href={PHONE.href} className="tnum whitespace-nowrap text-fog-50 hover:text-accent-200">
								{PHONE.label}
							</a>
							, ответим по делу.
						</p>
					</Reveal>
					<Reveal delay={0.08} className="lg:col-span-8">
						<Faq items={FAQ} defaultOpen={0} />
					</Reveal>
				</section>

				<Reveal
					delay={0.1}
					className="mt-16 flex flex-col gap-5 rounded-lg border border-white/8 bg-ink-900 px-6 py-7 sm:flex-row sm:items-center sm:justify-between md:mt-24 md:px-8"
				>
					<div>
						<p className="font-semibold text-fog-50">Готовы обсудить машину?</p>
						<p className="mt-1 text-sm text-fog-400">
							Инженер перезвонит, уточнит комплектацию и назовёт срок изготовления.
						</p>
					</div>
					<button
						type="button"
						onClick={() => openRequest('Покупка и доставка')}
						className="btn btn-primary shrink-0"
					>
						Оставить заявку
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
