#!/usr/bin/env node
/**
 * Заполняет БД текущим снимком content/*.json.
 *
 *   DATABASE_URL=postgres://… npm run db:seed            — только пустые разделы
 *   DATABASE_URL=postgres://… npm run db:seed -- --force — перезаписать всё снимком
 *
 * Без --force уже существующие в БД разделы не трогаются: правки,
 * сделанные в админке, не пропадут от случайного повторного запуска.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { CONTENT_DIR, CONTENT_KEYS, shapeError } from './content-keys.mjs';

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('✖ Задайте DATABASE_URL (строка подключения к Neon)');
	process.exit(1);
}
const force = process.argv.includes('--force');
const sql = neon(url);

for (const key of CONTENT_KEYS) {
	const data = JSON.parse(await readFile(path.join(CONTENT_DIR, `${key}.json`), 'utf8'));
	const problem = shapeError(key, data);
	if (problem) {
		console.error(`✖ content/${key}.json: ${problem}`);
		process.exit(1);
	}
	const json = JSON.stringify(data);
	const rows = force
		? await sql`
			insert into content (key, data, updated_at) values (${key}, ${json}::jsonb, now())
			on conflict (key) do update set data = excluded.data, updated_at = now()
			returning key`
		: await sql`
			insert into content (key, data, updated_at) values (${key}, ${json}::jsonb, now())
			on conflict (key) do nothing
			returning key`;
	console.log(rows.length ? `✔ ${key}: записан из снимка` : `• ${key}: уже есть в БД — пропущен (--force, чтобы перезаписать)`);
}
await sql`insert into admin_audit (action, key) values ('seed', ${force ? 'force' : null})`;
console.log('✔ Сид выполнен');
