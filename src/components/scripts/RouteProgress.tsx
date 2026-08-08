import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/** Тонкая полоса загрузки маршрута в фирменном цвете, поверх шапки. */
export default function RouteProgress() {
	const location = useLocation();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		const timer = window.setTimeout(() => setIsLoading(false), 450);
		return () => window.clearTimeout(timer);
	}, [location.pathname]);

	if (!isLoading) return null;

	return (
		<div className="fixed inset-x-0 top-0 z-90 h-0.5 overflow-hidden" aria-hidden>
			<div className="h-full w-1/3 animate-[sokol-sheen_0.9s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
		</div>
	);
}
