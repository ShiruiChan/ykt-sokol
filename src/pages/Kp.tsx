import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ADDRESS, BRAND, PHONE, PHONES, SITE_URL } from '../config/site';
import { COMPANY } from '../config/legal';
import { productPath } from '../data/products';
import { rublesInWords } from '../utils/rubles';
import {
	formatDate,
	loadBuyer,
	parseKp,
	sendKp,
	useKpSend,
	type KpBuyer,
	type KpDocument,
} from '../utils/kp';
import { reachGoal } from '../components/Metrika';
import { ArrowLeft, ArrowRight, ArrowUpRight, Phone } from '../components/Icons';

/**
 * Коммерческое предложение — документ в виде «счёта-договора».
 * Состав берётся из адреса (?model=…&opts=…&n=…), покупатель — из
 * sessionStorage. «Скачать PDF» — штатная печать браузера с отдельной
 * print-вёрсткой (index.css, @media print): без тяжёлых PDF-библиотек.
 * Страница закрыта от индексации и не попадает в sitemap.
 */

/** 1 660 000,00 — как в бухгалтерских документах */
const money = (n: number) =>
	n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PREPAYMENT = 50_000;

/** Назад к форме модели с той же выбранной комплектацией */
const backToModel = (doc: KpDocument) =>
	`${productPath(doc.product)}${
		doc.options.length ? `?opts=${doc.options.map((a) => a.id).join(',')}` : ''
	}#form-section`;

/** Телефон не рвётся посередине номера */
const Nb = ({ children }: { children: ReactNode }) => (
	<span className="whitespace-nowrap">{children}</span>
);

type Row = { name: string; qty: number; unit: string; price: number };

function KpSheet({ doc, buyer }: { doc: KpDocument; buyer: KpBuyer | null }) {
	const rows: Row[] = [
		{ name: `Снегоболотоход «${doc.product.name}», базовая комплектация`, qty: doc.qty, unit: 'шт.', price: doc.product.price },
		// Опции ставятся на каждую машину
		...doc.options.map((a) => ({ name: a.name, qty: doc.qty, unit: 'шт.', price: a.price })),
	];

	return (
		<article className="kp-sheet" aria-label={`Коммерческое предложение ${doc.number}`}>
			<header className="kp-head">
				<div>
					<p className="kp-brand">{COMPANY.name}</p>
					<p className="kp-muted">Производство снегоболотоходов · {ADDRESS.full}</p>
				</div>
				<p className="kp-muted kp-right">
					{PHONES.main.label}
					<br />
					{PHONES.extra.label}
				</p>
			</header>

			<h1 className="kp-title">
				Коммерческое предложение № {doc.number} от {formatDate(doc.date)}
			</h1>

			<dl className="kp-parties">
				<dt>Поставщик:</dt>
				<dd>
					{COMPANY.name}, ИНН {COMPANY.inn}, КПП {COMPANY.kpp}
					{COMPANY.ogrn && `, ОГРН ${COMPANY.ogrn}`}; Адрес: {COMPANY.legalAddress}.
					<br />
					Производство: {ADDRESS.full}; тел. <Nb>{PHONES.main.label}</Nb>, <Nb>{PHONES.extra.label}</Nb>.
				</dd>
				<dt>Покупатель:</dt>
				<dd>
					{buyer ? (
						<>
							{buyer.name}
							{buyer.inn && `, ИНН ${buyer.inn}`}; тел. <Nb>{buyer.phone}</Nb>.
						</>
					) : (
						<span className="kp-muted">
							не указан — данные покупателя хранятся только в той вкладке, где сформировано КП
						</span>
					)}
				</dd>
			</dl>

			<table className="kp-table">
				<thead>
					<tr>
						<th className="kp-num">№</th>
						<th>Наименование</th>
						<th className="kp-num">Кол-во</th>
						<th>Ед.</th>
						<th className="kp-num">Цена, ₽</th>
						<th className="kp-num">Сумма, ₽</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={`${i}-${r.name}`}>
							<td className="kp-num">{i + 1}</td>
							<td>{r.name}</td>
							<td className="kp-num">{r.qty}</td>
							<td>{r.unit}</td>
							<td className="kp-num">{money(r.price)}</td>
							<td className="kp-num">{money(r.price * r.qty)}</td>
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={5} className="kp-num">
							Всего к оплате:
						</td>
						<td className="kp-num">{money(doc.total)}</td>
					</tr>
				</tfoot>
			</table>

			<p className="kp-sum">
				Всего наименований {rows.length}, на сумму {money(doc.total)} руб.
				<br />
				<strong>{rublesInWords(doc.total)}</strong>
				<br />
				{COMPANY.vat || 'Налоговый режим (НДС) уточняйте у менеджера при согласовании договора.'}
			</p>

			{doc.product.defaultKit.length > 0 && (
				<section className="kp-block">
					<h2>Базовая комплектация (входит в стоимость модели)</h2>
					<ul className="kp-kit">
						{doc.product.defaultKit.map((item) => (
							<li key={item.name}>
								{item.name} — {item.quantity}
							</li>
						))}
					</ul>
				</section>
			)}

			{buyer?.comment && (
				<section className="kp-block">
					<h2>Комментарий покупателя</h2>
					<p className="kp-pre">{buyer.comment}</p>
				</section>
			)}

			<section className="kp-block">
				<h2>Условия</h2>
				<ol className="kp-terms">
					<li>
						Предоплата {PREPAYMENT.toLocaleString('ru-RU')} ₽ вносится после согласования комплектации с менеджером
						Поставщика.
					</li>
					<li>Остаток стоимости оплачивается перед выдачей техники.</li>
					<li>Срок изготовления и стоимость доставки сообщает менеджер при согласовании.</li>
					<li>Коммерческое предложение действительно 10 (десять) рабочих дней с даты оформления.</li>
					<li>Коммерческое предложение носит информационный характер и не является публичной офертой.</li>
					<li>Онлайн-оплата на сайте не принимается; порядок оплаты согласуется с менеджером.</li>
				</ol>
			</section>

			<footer className="kp-foot kp-muted">
				Документ сформирован на сайте {SITE_URL.replace(/^https?:\/\//, '')} по выбранной покупателем комплектации. Менеджер: тел.{' '}
				<Nb>{PHONES.main.label}</Nb>.
			</footer>
		</article>
	);
}

function SendStatus({ doc, buyer }: { doc: KpDocument; buyer: KpBuyer | null }) {
	const status = useKpSend((s) => s.status[doc.code]);
	if (!status) return null;

	const tone =
		status === 'error'
			? 'border-[#a8543f]/50 bg-[#2a1512] text-[#e5a894]'
			: 'border-white/10 bg-ink-850 text-fog-200';

	return (
		<div role="status" className={`rounded-sm border px-4 py-3 text-sm ${tone}`}>
			{status === 'sending' && 'Отправляем КП менеджеру…'}
			{status === 'sent' &&
				'КП отправлено менеджеру. Он перезвонит в рабочее время и согласует комплектацию.'}
			{status === 'error' && (
				<>
					Не удалось отправить КП менеджеру. Документ при этом готов — сохраните его и позвоните{' '}
					<a href={PHONE.href} className="tnum underline">
						{PHONE.label}
					</a>
					{buyer && (
						<>
							{' '}
							или{' '}
							<button type="button" onClick={() => sendKp(doc, buyer)} className="underline">
								повторите отправку
							</button>
						</>
					)}
					.
				</>
			)}
		</div>
	);
}

export default function Kp() {
	const { search } = useLocation();
	// Пререндер и первый проход гидрации рисуют заглушку: адрес и sessionStorage есть только в браузере
	const [ready, setReady] = useState(false);
	const [doc, setDoc] = useState<KpDocument | null>(null);
	const [buyer, setBuyer] = useState<KpBuyer | null>(null);

	useEffect(() => {
		const parsed = parseKp(search);
		setDoc(parsed);
		setBuyer(parsed ? loadBuyer(parsed.code) : null);
		setReady(true);
	}, [search]);

	// Имя файла при «Сохранить как PDF» берётся из заголовка вкладки
	useEffect(() => {
		if (!doc) return;
		const prev = document.title;
		document.title = `${doc.number}-${BRAND.replace(/\s+/g, '-')}`;
		return () => {
			document.title = prev;
		};
	}, [doc]);

	// Print-вёрстка включается только на этой странице
	useEffect(() => {
		document.documentElement.classList.add('kp-route');
		return () => document.documentElement.classList.remove('kp-route');
	}, []);

	const print = () => {
		if (doc) reachGoal('kp_pdf', { model: doc.product.name });
		window.print();
	};

	return (
		<main id="main" className="kp-main flex-1 bg-ink-950 pt-28 pb-20 md:pt-32">
			<div className="shell">
				{!ready ? (
					<div className="skeleton mx-auto h-[60vh] max-w-[210mm] rounded-md" aria-hidden />
				) : !doc ? (
					<div className="mx-auto max-w-xl py-16 text-center">
						<h1 className="text-heading text-fog-50">Коммерческое предложение не найдено</h1>
						<p className="mt-4 text-fog-400">
							Ссылка неполная или устарела. Соберите комплектацию на странице модели и сформируйте КП
							заново.
						</p>
						<Link to="/#catalog" className="btn btn-primary btn-rect mt-8">
							К моделям
							<ArrowUpRight className="h-4 w-4" />
						</Link>
					</div>
				) : (
					<>
						<div className="kp-toolbar mx-auto flex max-w-[210mm] flex-col gap-4 print:hidden">
							<div className="flex flex-wrap items-center gap-3">
								<button type="button" onClick={print} className="btn btn-primary btn-rect">
									Скачать PDF
									<ArrowRight className="h-4 w-4 rotate-90" />
								</button>
								<a href={PHONE.href} className="btn btn-ghost btn-rect">
									<Phone className="h-4 w-4" />
									Позвонить
								</a>
								<Link
									to={backToModel(doc)}
									className="link-quiet ml-auto text-sm"
								>
									<ArrowLeft className="h-4 w-4" />
									Назад к модели
								</Link>
							</div>
							<SendStatus doc={doc} buyer={buyer} />
							<p className="text-xs text-fog-500">
								В окне печати выберите «Сохранить как PDF». Предоплата {PREPAYMENT.toLocaleString('ru-RU')} ₽ — только
								после согласования с менеджером.
							</p>
						</div>

						<div className="kp-paper mx-auto mt-6 max-w-[210mm]">
							<KpSheet doc={doc} buyer={buyer} />
						</div>
					</>
				)}
			</div>
		</main>
	);
}
