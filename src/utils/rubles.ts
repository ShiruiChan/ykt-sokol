/**
 * Сумма прописью для документов: «Один миллион шестьсот шестьдесят тысяч
 * рублей 00 копеек». Чистый модуль без зависимостей — его же гоняет
 * юнит-проверка (src/utils/rubles.test.mjs).
 */

const ONES_M = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const ONES_F = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const TEENS = [
	'десять',
	'одиннадцать',
	'двенадцать',
	'тринадцать',
	'четырнадцать',
	'пятнадцать',
	'шестнадцать',
	'семнадцать',
	'восемнадцать',
	'девятнадцать',
];
const TENS = [
	'',
	'',
	'двадцать',
	'тридцать',
	'сорок',
	'пятьдесят',
	'шестьдесят',
	'семьдесят',
	'восемьдесят',
	'девяносто',
];
const HUNDREDS = [
	'',
	'сто',
	'двести',
	'триста',
	'четыреста',
	'пятьсот',
	'шестьсот',
	'семьсот',
	'восемьсот',
	'девятьсот',
];

type Forms = [one: string, few: string, many: string];

/** 1 рубль, 2 рубля, 5 рублей */
export function plural(n: number, forms: Forms): string {
	const n10 = n % 10;
	const n100 = n % 100;
	if (n10 === 1 && n100 !== 11) return forms[0];
	if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1];
	return forms[2];
}

/** Тройка цифр словами; feminine — для тысяч («одна», «две») */
function triad(n: number, feminine: boolean): string[] {
	const words: string[] = [];
	const h = Math.floor(n / 100);
	const rest = n % 100;
	if (h) words.push(HUNDREDS[h]);
	if (rest >= 10 && rest < 20) {
		words.push(TEENS[rest - 10]);
	} else {
		const t = Math.floor(rest / 10);
		const o = rest % 10;
		if (t) words.push(TENS[t]);
		if (o) words.push((feminine ? ONES_F : ONES_M)[o]);
	}
	return words;
}

const SCALES: { value: number; forms: Forms; feminine: boolean }[] = [
	{ value: 1e9, forms: ['миллиард', 'миллиарда', 'миллиардов'], feminine: false },
	{ value: 1e6, forms: ['миллион', 'миллиона', 'миллионов'], feminine: false },
	{ value: 1e3, forms: ['тысяча', 'тысячи', 'тысяч'], feminine: true },
];

/** Целое число словами в мужском роде: 1 001 001 → «один миллион одна тысяча один» */
export function integerInWords(value: number): string {
	let n = Math.floor(Math.abs(value));
	if (n === 0) return 'ноль';
	if (n >= 1e12) throw new RangeError('Сумма слишком велика');

	const words: string[] = [];
	for (const scale of SCALES) {
		const chunk = Math.floor(n / scale.value);
		if (chunk) {
			words.push(...triad(chunk, scale.feminine), plural(chunk, scale.forms));
			n %= scale.value;
		}
	}
	words.push(...triad(n, false));
	return words.join(' ');
}

/** Сумма в рублях прописью с копейками, первая буква заглавная */
export function rublesInWords(amount: number): string {
	if (!Number.isFinite(amount) || amount < 0) throw new RangeError('Некорректная сумма');
	const kopecksTotal = Math.round(amount * 100);
	const rubles = Math.floor(kopecksTotal / 100);
	const kopecks = kopecksTotal % 100;

	const text = `${integerInWords(rubles)} ${plural(rubles, ['рубль', 'рубля', 'рублей'])} ${String(
		kopecks
	).padStart(2, '0')} ${plural(kopecks, ['копейка', 'копейки', 'копеек'])}`;
	return text.charAt(0).toUpperCase() + text.slice(1);
}
