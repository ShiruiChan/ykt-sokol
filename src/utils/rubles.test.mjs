// Юнит-проверка суммы прописью. Запуск: npm test (Node 22+, без зависимостей)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rublesInWords, integerInWords } from './rubles.ts';

test('сумма прописью', () => {
	assert.equal(rublesInWords(1_660_000), 'Один миллион шестьсот шестьдесят тысяч рублей 00 копеек');
	assert.equal(rublesInWords(21_500), 'Двадцать одна тысяча пятьсот рублей 00 копеек');
	assert.equal(rublesInWords(1_001_001), 'Один миллион одна тысяча один рубль 00 копеек');
	assert.equal(rublesInWords(0), 'Ноль рублей 00 копеек');
});

test('склонения и краевые случаи', () => {
	assert.equal(rublesInWords(2), 'Два рубля 00 копеек');
	assert.equal(rublesInWords(11), 'Одиннадцать рублей 00 копеек');
	assert.equal(rublesInWords(40_650), 'Сорок тысяч шестьсот пятьдесят рублей 00 копеек');
	assert.equal(rublesInWords(911.9), 'Девятьсот одиннадцать рублей 90 копеек');
	assert.equal(rublesInWords(2_000_000), 'Два миллиона рублей 00 копеек');
	assert.equal(rublesInWords(1.01), 'Один рубль 01 копейка');
	assert.equal(integerInWords(112_000), 'сто двенадцать тысяч');
	assert.equal(integerInWords(22_000_000), 'двадцать два миллиона');
	assert.throws(() => rublesInWords(-1));
});
