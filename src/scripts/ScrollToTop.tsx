import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Ссылка с якорем (/#catalog) — ждём, пока секция отрисуется, и едем к ней
    if (hash) {
      const id = hash.slice(1);
      // До 5 с: на медленной сети ленивый чанк страницы приходит не сразу
      let tries = 0;
      let timer = 0;
      const seek = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else if (tries++ < 50) timer = window.setTimeout(seek, 100);
      };
      seek();
      return () => window.clearTimeout(timer);
    }
    // При смене маршрута прокручиваем мгновенно: плавный скролл здесь
    // выглядит как «уезжающая» страница и мешает читать новую.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
