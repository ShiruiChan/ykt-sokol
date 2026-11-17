import type { ReactNode } from 'react';
import { ADDRESS, PHONE } from '../config/site';
import { LEGAL } from '../config/legal';

/** Нумерованный раздел юридической страницы (/privacy, /consent) */
export function LegalSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
	return (
		<section className="border-t border-white/8 pt-8 md:pt-10">
			<h2 className="flex items-baseline gap-4 text-heading text-fog-50">
				<span className="tnum text-sm font-semibold text-accent-400">{String(n).padStart(2, '0')}</span>
				{title}
			</h2>
			<div className="mt-5 space-y-4 leading-relaxed text-fog-200 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-fog-50 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
				{children}
			</div>
		</section>
	);
}

/** Как связаться с оператором: почта, если указана, иначе телефон и адрес */
export function ContactWays() {
	return (
		<ul>
			{LEGAL.email && (
				<li>
					по почте{' '}
					<a href={`mailto:${LEGAL.email}`} className="link-quiet">
						{LEGAL.email}
					</a>
					;
				</li>
			)}
			<li>
				по телефону{' '}
				<a href={PHONE.href} className="tnum link-quiet">
					{PHONE.label}
				</a>
				;
			</li>
			<li>письмом или лично по адресу: {LEGAL.legalAddress || ADDRESS.full}.</li>
		</ul>
	);
}
