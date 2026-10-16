/**
 * Видна ли нижняя панель сметы на странице модели. Отдельный стор, а не
 * экспорт из ProductPage: страница грузится лениво, и плавающая кнопка
 * связи не должна тянуть её чанк ради одного флага.
 */
import { create } from 'zustand';

interface BottomBarState {
	visible: boolean;
	setVisible: (visible: boolean) => void;
}

export const useBottomBar = create<BottomBarState>((set) => ({
	visible: false,
	setVisible: (visible) => set({ visible }),
}));
