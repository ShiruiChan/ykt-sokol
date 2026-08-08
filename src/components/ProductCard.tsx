import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import ImageGallery from './ImageGallery';
import { ArrowUpRight, Image as ImageIcon } from './Icons';
import type { Product } from '../types';

interface Props {
	product: Product;
}

/** Четыре характеристики, которые решают при выборе — остальное на странице модели */
function keySpecs(product: Product) {
	return [
		{ k: 'Двигатель', v: product.specs.engine },
		{ k: 'Клиренс', v: product.specs.clearance },
		{ k: 'Мест', v: product.specs.seats },
		{ k: 'Скорость', v: product.specs.maxSpeed },
	].filter((s) => Boolean(s.v));
}

export default function ProductCard({ product }: Props) {
	const [isGalleryOpen, setIsGalleryOpen] = useState(false);
	const hasImages = product.images?.length > 0;

	return (
		<>
			<article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/7 bg-ink-850 transition-[border-color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-white/16">
				{/* Кадр */}
				<Link
					to={`/product/${product.id}`}
					className="relative block aspect-[4/3] overflow-hidden bg-ink-900"
					aria-label={`Открыть страницу модели ${product.name}`}
				>
					{hasImages ? (
						<img
							src={product.images[0]}
							alt={`Снегоболотоход ${product.name}`}
							className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
							loading="lazy"
							decoding="async"
						/>
					) : (
						<div className="hatch grid h-full w-full place-items-center text-fog-500">
							<div className="text-center">
								<ImageIcon className="mx-auto h-9 w-9 opacity-60" />
								<p className="mt-3 text-xs tracking-[0.18em] uppercase">фото готовится</p>
							</div>
						</div>
					)}

					<div
						aria-hidden
						className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,10,10,0.85)_0%,transparent_50%)]"
					/>

					<h3 className="absolute right-5 bottom-4 left-5 font-display text-xl leading-tight tracking-[0.02em] text-fog-50 uppercase">
						{product.name}
					</h3>
				</Link>

				{/* Содержание */}
				<div className="flex flex-1 flex-col p-5">
					<p className="line-clamp-3 min-h-[4.2rem] text-sm leading-relaxed text-fog-400">
						{product.deskSmall}
					</p>

					<dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
						{keySpecs(product).map((s) => (
							<div key={s.k}>
								<dt className="text-[11px] tracking-[0.14em] text-fog-500 uppercase">{s.k}</dt>
								<dd className="tnum mt-1 line-clamp-2 text-sm font-semibold text-fog-200">
									{s.v}
								</dd>
							</div>
						))}
					</dl>

					{/* Цена и действия прижаты к низу — линия кнопок ровная во всём ряду */}
					<div className="mt-auto pt-6">
						<div className="flex items-end justify-between border-t border-white/8 pt-4">
							<div>
								<span className="block text-[11px] tracking-[0.14em] text-fog-500 uppercase">
									цена от
								</span>
								<span className="tnum mt-1 block text-xl font-bold text-fog-50">
									{product.price.toLocaleString('ru-RU')} ₽
								</span>
							</div>
							{hasImages && (
								<button
									type="button"
									onClick={() => setIsGalleryOpen(true)}
									className="link-quiet text-sm"
								>
									{product.images.length} фото
								</button>
							)}
						</div>

						<Link to={`/product/${product.id}`} className="btn btn-primary mt-4 w-full">
							Характеристики и цена
							<span className="btn-dot">
								<ArrowUpRight className="h-4 w-4" />
							</span>
						</Link>
					</div>
				</div>
			</article>

			<Modal
				isOpen={isGalleryOpen}
				onClose={() => setIsGalleryOpen(false)}
				title={product.name}
				size="lg"
			>
				<div className="p-5 sm:p-6">
					{hasImages ? (
						<ImageGallery images={product.images} alt={product.name} />
					) : (
						<p className="py-10 text-center text-fog-400">Фотографии готовятся</p>
					)}
					<Link
						to={`/product/${product.id}`}
						className="btn btn-primary mt-6 w-full sm:w-auto"
						onClick={() => setIsGalleryOpen(false)}
					>
						Перейти к модели
						<span className="btn-dot">
							<ArrowUpRight className="h-4 w-4" />
						</span>
					</Link>
				</div>
			</Modal>
		</>
	);
}
