import DocumentCard from '../components/DocumentCard';
import { DOCUMENTS } from '../data/documents';
import Reveal from '../components/Reveal';
import { useRequestModal } from '../components/RequestModal';
import { ArrowUpRight } from '../components/Icons';

/** Список документов — снимок content/documents.json, правится в админ-панели */
export default function Documents() {
	const openRequest = useRequestModal((s) => s.open);

	return (
		<>
			<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
				<div className="shell">
					<Reveal className="max-w-2xl">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							документы
						</p>
						<h1 className="mt-5 text-title text-fog-50">Сертификаты и патент</h1>
						<p className="mt-5 text-lede text-fog-400">
							Сертификаты соответствия ЕАЭС на снегоболотоходы и двигатели, патент на раму.
							Файлы можно открыть прямо здесь или скачать.
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
		</>
	);
}
