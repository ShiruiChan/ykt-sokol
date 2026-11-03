import type { Product } from "../types";
import productsData from "../../content/products.json";

/**
 * Модели берутся из снимка content/products.json. Снимок правится в
 * админ-панели (/admin) и перед сборкой подтягивается из БД
 * (scripts/pull-content.mjs); без БД сайт собирается на последнем снимке.
 */
export const products: Product[] = productsData as Product[];

export const productBySlug = (slug?: string) => products.find((p) => p.slug === slug);

export const productPath = (p: Pick<Product, "slug">) => `/models/${p.slug}`;

/**
 * Русское склонение по числу: plural(6, ['модель', 'модели', 'моделей']).
 * Лежит рядом с данными, потому что нужно везде, где выводится число моделей.
 */
export const plural = (n: number, [one, few, many]: [string, string, string]) => {
	const m10 = n % 10;
	const m100 = n % 100;
	if (m10 === 1 && m100 !== 11) return one;
	if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
	return many;
};
