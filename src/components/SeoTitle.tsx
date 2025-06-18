import { useEffect } from 'react';

export default function SeoTitle({ title }) {
  useEffect(() => {
    document.title = `${title} | YktSokol`;
    return () => {
      // Восстанавливаем дефолтный заголовок при размонтировании
      document.title = 'YktSokol';
    };
  }, [title]);

  return null;
}