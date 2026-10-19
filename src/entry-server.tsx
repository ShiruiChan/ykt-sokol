/**
 * Серверная точка входа — только для пререндера (scripts/prerender.mjs).
 * Рендерит страницу по адресу в HTML, дожидаясь всех lazy-чанков,
 * чтобы поисковик получил готовый текст, а не пустой #root.
 */
import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App';

export { ALL_PATHS, getMeta } from './seo/meta';
export { SITE_URL } from './config/site';

export async function render(url: string): Promise<string> {
	const { prelude } = await prerenderToNodeStream(
		<StrictMode>
			<StaticRouter location={url}>
				<App />
			</StaticRouter>
		</StrictMode>
	);

	const chunks: Buffer[] = [];
	for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
	return Buffer.concat(chunks).toString('utf8');
}
