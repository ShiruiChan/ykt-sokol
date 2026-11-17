/**
 * PostgreSQL для служебных скриптов (миграция, сид, сборка).
 * sql`… ${value}` — значения уходят параметрами. Не забудьте sql.end().
 */
import pg from 'pg';

export function connect(url) {
	const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10_000 });
	const ready = client.connect();
	const sql = async (strings, ...values) => {
		await ready;
		const text = strings.reduce((acc, s, i) => acc + (i ? `$${i}` : '') + s, '');
		return (await client.query(text, values)).rows;
	};
	sql.query = async (text) => {
		await ready;
		return (await client.query(text)).rows;
	};
	sql.end = () => client.end().catch(() => {});
	return sql;
}
