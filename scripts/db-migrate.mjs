#!/usr/bin/env node
/**
 * Создаёт таблицы админки в PostgreSQL. Повторный запуск безопасен.
 *
 *   DATABASE_URL=postgres://… npm run db:migrate
 *
 * На сервере строка подключения лежит в /etc/ykt-sokol.env (см. deploy/README.md).
 * В лог она не выводится.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { connect } from './pg.mjs';
import { ROOT } from './content-keys.mjs';

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('✖ Задайте DATABASE_URL (строка подключения к PostgreSQL)');
	process.exit(1);
}

const sql = connect(url);
const dir = path.join(ROOT, 'db');
const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
	const text = await readFile(path.join(dir, file), 'utf8');
	const statements = text
		.replace(/--.*$/gm, '')
		.split(';')
		.map((s) => s.trim())
		.filter(Boolean);
	for (const statement of statements) await sql.query(statement);
	console.log(`✔ ${file}: выражений ${statements.length}`);
}
console.log('✔ Миграция выполнена');
await sql.end();
