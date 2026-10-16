import { useMemo, useState, useSyncExternalStore } from 'react';
import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import GalleryCard from '../components/GalleryCard';
import Reveal from '../components/Reveal';
import { ChevronDown } from '../components/Icons';
import { GALLERY_PHOTOS, type GalleryPhoto } from '../data/gallery';

const INITIAL_VISIBLE = 12;
const BATCH_SIZE = 12;

// Брейкпоинты Tailwind: sm 2, lg 3, xl 4 колонки
const COLUMN_QUERIES: [string, number][] = [
	['(min-width: 1280px)', 4],
	['(min-width: 1024px)', 3],
	['(min-width: 640px)', 2],
];

// Ширина колонки при каждом раскладе: shell max 82rem, поля 2rem, зазор 1rem
const TILE_SIZES = '(min-width: 1280px) 300px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 92vw';

// Зазор между плитками в долях ширины колонки — чтобы оценка высоты колонки не врала
const GAP_RATIO = 0.05;

function readColumns(): number {
	const hit = COLUMN_QUERIES.find(([q]) => window.matchMedia(q).matches);
	return hit ? hit[1] : 1;
}

function subscribeColumns(onChange: () => void) {
	const lists = COLUMN_QUERIES.map(([q]) => window.matchMedia(q));
	lists.forEach((m) => m.addEventListener('change', onChange));
	return () => lists.forEach((m) => m.removeEventListener('change', onChange));
}

// Пререндер не знает ширину экрана — отдаёт одну колонку; при гидрации React
// сам перейдёт на клиентское значение без ошибки рассинхрона
const useColumnCount = () => useSyncExternalStore(subscribeColumns, readColumns, () => 1);

/**
 * Жадная раскладка в самую короткую колонку. Место кадра зависит только
 * от предыдущих кадров, поэтому догрузка добавляет снизу и ничего не двигает
 * (в отличие от CSS columns, которые перебалансируют всю сетку).
 */
function distribute(photos: GalleryPhoto[], columns: number) {
	const cols: { photo: GalleryPhoto; index: number }[][] = Array.from({ length: columns }, () => []);
	const heights = new Array<number>(columns).fill(0);
	photos.forEach((photo, index) => {
		const target = heights.indexOf(Math.min(...heights));
		cols[target].push({ photo, index });
		heights[target] += photo.height / photo.width + GAP_RATIO;
	});
	return cols;
}

// Лайтбокс листает всю серию в исходном порядке, даже ещё не показанные кадры
const SLIDES = GALLERY_PHOTOS.map((p) => ({ key: p.src, src: p.src }));

export default function GalleryPage() {
	const total = GALLERY_PHOTOS.length;
	const [visible, setVisible] = useState(INITIAL_VISIBLE);
	const [lightbox, setLightbox] = useState<number | null>(null);
	const columnCount = useColumnCount();
	const rest = total - visible;

	const columns = useMemo(
		() => distribute(GALLERY_PHOTOS.slice(0, visible), columnCount),
		[visible, columnCount]
	);

	return (
		<>
			<main id="main" className="flex-1 bg-ink-950 pt-32 md:pt-40">
				<div className="shell">
					<Reveal className="max-w-2xl">
						<p className="eyebrow">
							<span className="h-px w-8 bg-accent-400/70" />
							{total} кадров
						</p>
						<h1 className="mt-5 text-title text-fog-50">Галерея</h1>
						<p className="mt-5 text-lede text-fog-400">
							Цех, сборка и испытания. Снято на реке, на зимнике и в тайге — без студийного
							света и ретуши.
						</p>
					</Reveal>

					<div className="mt-12 flex items-start gap-4 md:mt-16">
						{columns.map((col, c) => (
							<div key={c} className="flex min-w-0 flex-1 flex-col gap-4">
								{col.map(({ photo, index }) => (
									<GalleryCard
										key={photo.src}
										photo={photo}
										index={index}
										sizes={TILE_SIZES}
										onOpen={() => setLightbox(index)}
									/>
								))}
							</div>
						))}
					</div>

					{rest > 0 && (
						<div className="mt-10 flex flex-col items-center gap-4 pb-4">
							<button
								type="button"
								onClick={() => setVisible((v) => Math.min(v + BATCH_SIZE, total))}
								className="btn btn-ghost"
							>
								Показать ещё
								<span className="btn-dot">
									<ChevronDown className="h-4 w-4" />
								</span>
							</button>
							<p className="tnum text-xs tracking-[0.16em] text-fog-500 uppercase">
								{visible} из {total}
							</p>
						</div>
					)}
				</div>

				<div className="h-20 md:h-28" />
			</main>

			{/* Слайдер управляется вручную: порядок колонок в DOM не совпадает с порядком кадров */}
			<PhotoSlider
				images={SLIDES}
				visible={lightbox !== null}
				index={lightbox ?? 0}
				onIndexChange={setLightbox}
				onClose={() => setLightbox(null)}
				maskOpacity={0.94}
				bannerVisible={false}
			/>
		</>
	);
}
