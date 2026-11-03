#!/usr/bin/env node
/**
 * Создаёт таблицы админки в Postgres (Neon). Повторный запуск безопасен.
 *
 *   DATABASE_URL=postgres://… npm run db:migrate
 *
 * Строку подключения берите в Vercel → Storage → Neon → .env.local
 * (или `vercel env pull`). В лог она не выводится.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { ROOT } from './content-keys.mjs';

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('✖ Задайте DATABASE_URL (строка подключения к Neon)');
	process.exit(1);
}

const sql = neon(url);
const dir = path.join(ROOT, 'db');
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
	const text = await readFile(path.join(dir, file), 'utf8');
	// HTTP-драйвер Neon выполняет по одному выражению за запрос
	const statements = text
		.replace(/--.*$/gm, '')
		.split(';')
		.map((s) => s.trim())
		.filter(Boolean);
	for (const statement of statements) await sql.query(statement);
	console.log(`✔ ${file}: выражений ${statements.length}`);
}
console.log('✔ Миграция выполнена');
