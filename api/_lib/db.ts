/**
 * Подключение к PostgreSQL (любой: на своём сервере, Timeweb Cloud,
 * Yandex Managed PostgreSQL, Selectel). Один пул на процесс.
 *
 * sql`select … where key = ${key}` — значения уходят параметрами ($1, $2…),
 * в текст запроса не подставляются.
 */
import pg from 'pg';

type Row = Record<string, any>;
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

const pools = new Map<string, pg.Pool>();

export function sqlFor(url: string): Sql {
	let pool = pools.get(url);
	if (!pool) {
		pool = new pg.Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000 });
		// Обрыв простаивающего соединения не должен ронять сервер
		pool.on('error', (e) => console.error('pg_pool_error', e.message));
		pools.set(url, pool);
	}
	const p = pool;
	return async (strings, ...values) => {
		const text = strings.reduce((acc, s, i) => acc + (i ? `$${i}` : '') + s, '');
		const res = await p.query(text, values);
		return res.rows;
	};
}
