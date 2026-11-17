/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Номер счётчика Яндекс.Метрики */
	readonly VITE_YM_ID?: string;
	/** Боевой адрес сайта, например https://yktsokol.ru */
	readonly VITE_SITE_URL?: string;
}
