/**
 * Хранилище содержимого сайта.
 *
 * Прод: только Postgres (Neon) по DATABASE_URL.
 * Локальная разработка: файловый адаптер поверх content/*.json —
 * включается флагом ADMIN_CONTENT_STORE=file и только вне Vercel
 * (переменная VERCEL там всегда задана), чтобы на проде запись
 * в файловую систему функции не могла случиться даже по ошибке.
 */
import { neon } from '@neondatabase/serverless';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ContentKey } from '../../src/admin/schema.js';

export interface StoredContent {
	data: unknown;
	/** Версия для защиты от затирания из соседней вкладки */
	version: string;
}

export interface AuditEvent {
	action: string;
	at: string;
}

export interface ContentStore {
	kind: 'postgres' | 'file';
	get(key: ContentKey): Promise<StoredContent | null>;
	put(key: ContentKey, data: unknown): Promise<string>;
	audit(action: string, key: string | null): Promise<void>;
	/** Время последнего события данного типа */
	lastAt(action: string): Promise<string | null>;
	/** Сколько событий action с этим key было за последние windowSec секунд */
	countRecent(action: string, key: string, windowSec: number): Promise<number>;
}

function postgresStore(url: string): ContentStore {
	const sql = neon(url);
	return {
		kind: 'postgres',
		async get(key) {
			const rows = await sql`select data, updated_at from content where key = ${key}`;
			if (!rows.length) return null;
			return { data: rows[0].data, version: new Date(rows[0].updated_at).toISOString() };
		},
		async put(key, data) {
			const rows = await sql`
				insert into content (key, data, updated_at)
				values (${key}, ${JSON.stringify(data)}::jsonb, now())
				on conflict (key) do update set data = excluded.data, updated_at = now()
				returning updated_at`;
			return new Date(rows[0].updated_at).toISOString();
		},
		async audit(action, key) {
			await sql`insert into admin_audit (action, key) values (${action}, ${key})`;
		},
		async lastAt(action) {
			const rows = await sql`select max(at) as at from admin_audit where action = ${action}`;
			return rows[0]?.at ? new Date(rows[0].at).toISOString() : null;
		},
		async countRecent(action, key, windowSec) {
			const rows = await sql`
				select count(*)::int as n from admin_audit
				where action = ${action} and key = ${key}
				  and at > now() - make_interval(secs => ${windowSec})`;
			return rows[0]?.n ?? 0;
		},
	};
}

/** Только для локальной разработки: читает и пишет снимок content/*.json напрямую */
function fileStore(root: string): ContentStore {
	const file = (key: ContentKey) => path.join(root, 'content', `${key}.json`);
	const auditFile = path.join(root, '.admin-dev', 'audit.json');
	let events: { action: string; key: string | null; at: string }[] | null = null;

	async function loadEvents() {
		if (events) return events;
		try {
			events = JSON.parse(await readFile(auditFile, 'utf8'));
		} catch {
			events = [];
		}
		return events!;
	}

	return {
		kind: 'file',
		async get(key) {
			try {
				const raw = await readFile(file(key), 'utf8');
				const { mtime } = await stat(file(key));
				return { data: JSON.parse(raw), version: mtime.toISOString() };
			} catch {
				return null;
			}
		},
		async put(key, data) {
			await writeFile(file(key), `${JSON.stringify(data, null, '\t')}\n`);
			const { mtime } = await stat(file(key));
			return mtime.toISOString();
		},
		async audit(action, key) {
			const list = await loadEvents();
			list.push({ action, key, at: new Date().toISOString() });
			await mkdir(path.dirname(auditFile), { recursive: true });
			await writeFile(auditFile, JSON.stringify(list.slice(-500), null, '\t'));
		},
		async lastAt(action) {
			const list = await loadEvents();
			const hit = [...list].reverse().find((e) => e.action === action);
			return hit?.at ?? null;
		},
		async countRecent(action, key, windowSec) {
			const since = Date.now() - windowSec * 1000;
			const list = await loadEvents();
			return list.filter((e) => e.action === action && e.key === key && Date.parse(e.at) > since).length;
		},
	};
}

let cached: ContentStore | null | undefined;

/** null — хранилище не настроено (на проде нет DATABASE_URL) */
export function getStore(): ContentStore | null {
	if (cached !== undefined) return cached;
	const url = process.env.DATABASE_URL;
	if (url) cached = postgresStore(url);
	else if (process.env.ADMIN_CONTENT_STORE === 'file' && !process.env.VERCEL) cached = fileStore(process.env.ADMIN_CONTENT_ROOT || process.cwd());
	else cached = null;
	return cached;
}
