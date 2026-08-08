import { useState } from 'react';
import Modal from './Modal';
import { ArrowUpRight, Certificate } from './Icons';

export interface DocumentItem {
	id: string;
	url: string;
	title: string;
	description?: string;
}

interface DocumentCardProps {
	document: DocumentItem;
}

export default function DocumentCard({ document: doc }: DocumentCardProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<article className="group flex h-full flex-col rounded-lg border border-white/8 bg-ink-850 p-6 transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-white/18">
				<Certificate className="h-8 w-8 text-accent-200 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-0.5" />

				<h3 className="mt-5 text-lg font-semibold text-fog-50">{doc.title}</h3>
				{doc.description && (
					<p className="mt-2 text-sm leading-relaxed text-fog-400">{doc.description}</p>
				)}

				<div className="mt-auto flex items-center gap-5 pt-6">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="text-sm font-semibold text-fog-50 transition-colors hover:text-accent-200"
					>
						Смотреть
					</button>
					<a
						href={doc.url}
						download
						className="link-quiet text-sm"
						onClick={(e) => e.stopPropagation()}
					>
						Скачать PDF
						<ArrowUpRight className="h-4 w-4" />
					</a>
				</div>
			</article>

			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={doc.title} size="lg">
				<div className="p-4 sm:p-6">
					<iframe
						src={doc.url}
						title={doc.title}
						className="h-[70dvh] w-full rounded-md border border-white/8 bg-ink-900"
					/>
					<a href={doc.url} download className="btn btn-primary mt-5 w-full sm:w-auto">
						Скачать PDF
						<span className="btn-dot">
							<ArrowUpRight className="h-4 w-4" />
						</span>
					</a>
				</div>
			</Modal>
		</>
	);
}
