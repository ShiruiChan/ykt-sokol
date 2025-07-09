import { motion } from "framer-motion";
import { PhotoProvider, PhotoView } from "react-photo-view";

interface GalleryCardProps {
  src: string;
  index: number;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ src, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="mb-4 break-inside-avoid"
  >
    <PhotoProvider maskOpacity={0.9}>
      <PhotoView src={src}>
        <img
          src={src}
          alt={`Работа ${index + 1}`}
          loading="lazy"
          decoding="async"
          className="w-full rounded-lg shadow transition hover:shadow-lg"
        />
      </PhotoView>
    </PhotoProvider>
  </motion.div>
);

export default GalleryCard;