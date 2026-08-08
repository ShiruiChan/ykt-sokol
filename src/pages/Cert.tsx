import { Helmet } from 'react-helmet';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DocumentCard, { type DocumentItem } from '../components/DocumentCard';
import Reveal from '../components/Reveal';
import { useRequestModal } from '../components/RequestModal';
import { ArrowUpRight } from '../components/Icons';

/**
 * Документы лежат статикой в /public/documents. Список фиксированный —
 * искусственная задержка и «загрузка» из прежней версии убраны:
 * скрывать мгновенно доступный контент за спиннером незачем.
 */
const DOCUMENTS: DocumentItem[] = [
	{
		id: 'doc-1',
		url: '/documents/document-1.pdf',
		title: 'Одобрение типа транспортного средства',
		description: 'Документ, на основании которого выдаётся электронный ПСМ.',
	},
	{
		id: 'doc-2',
		url: '/documents/document-2.pdf',
		title: 'Сертификат соответствия',
		description: 'Подтверждает соответствие техники требованиям технического регламента.',
	},
	{
		id: 'doc-3',
		url: '/documents/document-3.pdf',
		title: 'Протокол испытаний',
		description: 'Результаты проверок узлов и агрегатов в заявленных режимах.',
	},
	{
		id: 'doc-4',
		url: '/documents/document-4.pdf',
		title: 'Свидетельство о регистрации',
		description: 'Регистрационные данные предприятия-изготовителя.',
	},
];

export default function Documents() {
	const openRequest = useRequestModal((s) => s.open);

	return (
		<>
			<Helmet>
				<title>Документы и сертификаты — ЯКТ СОКОЛ</title>
				<meta
					name="description"
					content="Сертификаты соответствия, одобрение типа транспортного средства и протоколы испытаний снегоболотоходов СОКОЛ."
				/>
			</Helmet>

			<Header />

			<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
				<div className="shell">
					<Reveal className="max-w-2xl">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							документы
						</p>
						<h1 className="mt-5 text-title text-fog-50">Сертификаты и ПСМ</h1>
						<p className="mt-5 text-lede text-fog-400">
							Техника поставляется с полным пакетом документов и ставится на учёт как
							самоходная машина. Файлы можно открыть прямо здесь или скачать.
						</p>
					</Reveal>

					<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
						{DOCUMENTS.map((doc, i) => (
							<Reveal key={doc.id} delay={(i % 3) * 0.07} className="h-full">
								<DocumentCard document={doc} />
							</Reveal>
						))}
					</div>

					<Reveal
						delay={0.1}
						className="mt-14 flex flex-col gap-5 rounded-lg border border-white/8 bg-ink-900 px-6 py-7 sm:flex-row sm:items-center sm:justify-between md:mt-20 md:px-8"
					>
						<div>
							<p className="font-semibold text-fog-50">Нужен документ, которого здесь нет?</p>
							<p className="mt-1 text-sm text-fog-400">
								Вышлем копию по запросу — счёт, спецификацию или паспорт изделия.
							</p>
						</div>
						<button
							type="button"
							onClick={() => openRequest('Запрос документов')}
							className="btn btn-ghost shrink-0"
						>
							Запросить
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</button>
					</Reveal>
				</div>

				<div className="h-20 md:h-28" />
			</main>

			<Footer />
		</>
	);
}
