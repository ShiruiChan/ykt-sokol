import { useEffect } from 'react';

const BRAND = 'ЯКТ СОКОЛ';

export default function SeoTitle({ title }: { title: string }) {
	useEffect(() => {
		document.title = `${title} — ${BRAND}`;
	}, [title]);

	return null;
}
