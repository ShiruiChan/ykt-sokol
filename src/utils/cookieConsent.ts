/**
 * Согласие на cookie Яндекс.Метрики. Пока посетитель не нажал «Разрешить»,
 * счётчик не загружается. Выбор хранится в localStorage этого браузера.
 */
import { create } from 'zustand';

export type CookieChoice = 'granted' | 'denied';

const KEY = 'ykt-cookie-consent';

function read(): CookieChoice | null {
	try {
		const v = localStorage.getItem(KEY);
		return v === 'granted' || v === 'denied' ? v : null;
	} catch {
		return null;
	}
}

interface CookieConsentState {
	/** null — выбор ещё не сделан (или страница пререндерится) */
	choice: CookieChoice | null;
	/** Баннер открыт: выбора нет или его открыли из подвала */
	open: boolean;
	hydrate: () => void;
	choose: (choice: CookieChoice) => void;
	reopen: () => void;
}

export const useCookieConsent = create<CookieConsentState>((set, get) => ({
	choice: null,
	open: false,
	hydrate: () => {
		const choice = read();
		set({ choice, open: choice === null });
	},
	choose: (choice) => {
		const was = get().choice;
		try {
			localStorage.setItem(KEY, choice);
		} catch {
			// Приватный режим: выбор живёт до закрытия вкладки
		}
		set({ choice, open: false });
		// Уже загруженную Метрику не выгрузить — перезагружаем страницу без неё
		if (was === 'granted' && choice === 'denied') window.location.reload();
	},
	reopen: () => set({ open: true }),
}));
