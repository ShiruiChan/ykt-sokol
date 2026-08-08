import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { PhotoProvider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import Header from '../components/Header';
import Footer from '../components/Footer';
import GalleryCard from '../components/GalleryCard';
import Reveal from '../components/Reveal';
import { ChevronDown } from '../components/Icons';

const IMAGES_TOTAL = 65;
const INITIAL_VISIBLE = 12;
const BATCH_SIZE = 12;
const SRC = (i: number) => `/gallery/1 (${i}).webp`;

export default function GalleryPage() {
	const images = useMemo(
		() => Array.from({ length: IMAGES_TOTAL }, (_, i) => SRC(i + 1)),
		[]
	);
	const [visible, setVisible] = useState(INITIAL_VISIBLE);
	const rest = images.length - visible;

	return (
		<>
			<Helmet>
				<title>Галерея — снегоболотоходы ЯКТ СОКОЛ</title>
				<meta
					name="description"
					content="Фотографии снегоболотоходов СОКОЛ: производство в Якутске, испытания на бездорожье, снегу и воде."
				/>
			</Helmet>

			<Header />

			<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
				<div className="shell">
					<Reveal className="max-w-2xl">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							{IMAGES_TOTAL} кадров
						</p>
						<h1 className="mt-5 text-title text-fog-50">Галерея</h1>
						<p className="mt-5 text-lede text-fog-400">
							Цех, сборка и испытания. Снято на реке, на зимнике и в тайге — без студийного
							света и ретуши.
						</p>
					</Reveal>

					<div className="mt-12 md:mt-16">
						{/* Один провайдер на всю сетку — лайтбокс листает всю серию */}
						<PhotoProvider maskOpacity={0.94} bannerVisible={false}>
							<div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
								{images.slice(0, visible).map((src, i) => (
									<GalleryCard key={src} src={src} index={i} />
								))}
							</div>
						</PhotoProvider>
					</div>

					{rest > 0 && (
						<div className="mt-10 flex flex-col items-center gap-4 pb-4">
							<button
								type="button"
								onClick={() => setVisible((v) => Math.min(v + BATCH_SIZE, images.length))}
								className="btn btn-ghost"
							>
								Показать ещё
								<span className="btn-dot">
									<ChevronDown className="h-4 w-4" />
								</span>
							</button>
							<p className="tnum text-xs tracking-[0.16em] text-fog-500 uppercase">
								{visible} из {images.length}
							</p>
						</div>
					)}
				</div>

				<div className="h-20 md:h-28" />
			</main>

			<Footer />
		</>
	);
}
