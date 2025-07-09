import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import "react-photo-view/dist/react-photo-view.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GalleryCard from "../components/GalleryCard";

const IMAGES_TOTAL = 65;          // Кол-во файлов в /public/gallery
const INITIAL_VISIBLE = 10;       // Показываем при первой загрузке
const BATCH_SIZE = 10;            // Порция по кнопке «Ещё»
const TEMPLATE = (i: number) => `/gallery/1 (${i}).avif`;

function useGallerySources(total: number) {
  return useMemo(() => Array.from({ length: total }, (_, i) => TEMPLATE(i + 1)), [total]);
}

const GalleryPage = () => {
  const galleryImages = useGallerySources(IMAGES_TOTAL);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  const handleShowMore = () => {
    setVisible((prev) => Math.min(prev + BATCH_SIZE, galleryImages.length));
  };

  return (
		<>
		<Header />
			<div className="container mx-auto py-20 px-5 mt-5">
				<h1 className="mb-8 text-center text-4xl font-bold md:text-5xl text-zinc-300">Галерея работ</h1>

				{galleryImages.length === 0 ? (
					<p className="text-center text-muted-foreground">Изображения не найдены</p>
				) : (
					<motion.div
						layout
						className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4"
					>
						{galleryImages.slice(0, visible).map((src, i) => (
							<GalleryCard key={src} src={src} index={i} />
						))}
					</motion.div>
				)}

				{visible < galleryImages.length && (
					<div className="mt-8 text-center">
						<button
							onClick={handleShowMore}
							className="rounded-md bg-blue-500 px-6 py-2 text-white transition hover:bg-blue-600"
						>
							Показать ещё
						</button>
					</div>
				)}
			</div>
			<Footer />
		</>
    
  );
};

export default GalleryPage;