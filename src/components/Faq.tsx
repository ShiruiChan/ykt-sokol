import Reveal from './Reveal';
import { ChevronDown } from './Icons';
import { FAQ } from '../seo';

/**
 * Частые вопросы. Ответы лежат в DOM всегда (нативный <details>), поэтому
 * их читают и поисковики, и скринридеры. Тексты общие с разметкой FAQPage.
 */
export default function Faq() {
	return (
		<section className="section bg-ink-900">
			<div className="shell grid gap-10 lg:grid-cols-12 lg:gap-12">
				<Reveal className="lg:col-span-4">
					<p className="eyebrow">
						<span className="h-px w-8 bg-accent-400/70" />
						Вопросы
					</p>
					<h2 className="mt-5 text-title text-fog-50">Что спрашивают перед покупкой</h2>
				</Reveal>

				<Reveal delay={0.08} className="lg:col-span-8">
					<div className="overflow-hidden rounded-lg border border-white/8 bg-ink-850">
						{FAQ.map((item, i) => (
							<details
								key={item.q}
								className="group border-t border-white/8 first:border-t-0"
								open={i === 0}
							>
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/3 md:px-7 [&::-webkit-details-marker]:hidden">
									<h3 className="text-base font-semibold text-fog-50 md:text-lg">{item.q}</h3>
									<ChevronDown className="h-5 w-5 shrink-0 text-fog-400 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-180" />
								</summary>
								<p className="max-w-[62ch] px-5 pb-6 text-fog-400 md:px-7">{item.a}</p>
							</details>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	);
}
