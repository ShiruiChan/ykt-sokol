import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { CONTENT_DIR, CONTENT_KEYS, shapeError } from './content-keys.mjs';

test('снимок content/*.json проходит проверку формы', async () => {
	for (const key of CONTENT_KEYS) {
		const data = JSON.parse(await readFile(path.join(CONTENT_DIR, `${key}.json`), 'utf8'));
		assert.equal(shapeError(key, data), null, key);
	}
});

test('битые данные из БД не попадают в сборку', () => {
	assert.ok(shapeError('products', []));
	assert.ok(shapeError('products', [{ slug: 'x', price: '1 000', images: [] }]));
	assert.ok(shapeError('faq', { q: 'x' }));
	assert.ok(shapeError('site', []));
});
