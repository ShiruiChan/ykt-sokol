#!/usr/bin/env node
/**
 * Первый шаг сборки: свежие данные сайта из БД → content/*.json.
 *
 * Есть DATABASE_URL — читаем таблицу content и перезаписываем снимок
 * теми разделами, что нашлись в БД и прошли проверку формы.
 * Нет DATABASE_URL или БД недоступна — оставляем снимок из репозитория
 * и предупреждаем, но сборку не роняем: сайт должен собираться всегда.
 *
 * Запуск: npm run build (автоматически) или npm run content:pull.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_DIR, CONTENT_KEYS, shapeError } from './content-keys.mjs';

const warn = (msg) => console.warn(`⚠ pull-content: ${msg}`);

async function main() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		warn('DATABASE_URL не задан — сборка идёт на снимке content/*.json из репозитория');
		return;
	}

	let rows;
	try {
		const { neon } = await import('@neondatabase/serverless');
		const sql = neon(url);
		const timeout = new Promise((_, reject) =>
			setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'TIMEOUT' })), 15_000).unref()
		);
		rows = await Promise.race([sql`select key, data, updated_at from content`, timeout]);
	} catch (e) {
		warn(`БД недоступна (${e?.code ?? e?.name ?? 'ошибка'}) — сборка идёт на снимке content/*.json`);
		return;
	}

	let written = 0;
	for (const key of CONTENT_KEYS) {
		const row = rows.find((r) => r.key === key);
		if (!row) {
			warn(`раздела «${key}» нет в БД — оставлен снимок`);
			continue;
		}
		const problem = shapeError(key, row.data);
		if (problem) {
			warn(`раздел «${key}» в БД повреждён (${problem}) — оставлен снимок`);
			continue;
		}
		await writeFile(path.join(CONTENT_DIR, `${key}.json`), `${JSON.stringify(row.data, null, '\t')}\n`);
		written++;
		console.log(`✔ content/${key}.json ← БД (${new Date(row.updated_at).toISOString()})`);
	}
	console.log(`✔ pull-content: обновлено разделов: ${written} из ${CONTENT_KEYS.length}`);
}

await main();
