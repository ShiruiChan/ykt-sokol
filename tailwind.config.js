// tailwind.config.js
export const content = [
	"./index.html",
	"./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
	extend: {
		colors: {
			primary: '#E60012', // Красный акцент
			secondary: '#FF5722', // Оранжевый второстепенный
			dark: '#1A1A1A', // Темный фон
			light: '#F5F5F5', // Светлый фон
			grayText: '#666', // Серый текст
		},
	},
};
export const plugins = [];