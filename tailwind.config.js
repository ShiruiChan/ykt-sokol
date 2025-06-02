module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}"
	],
	theme: {
		extend: {
			colors: {
				primary: '#F60012', // 🔴 Основной цвет
				secondary: '#FF5722', // 🟠 Второстепенный
				dark: '#1A1A1A', // 🖤 Темный фон
				light: '#F5F5F5', // 🧼 Светлый фон
				grayText: '#666', // 📝 Серый текст
				orangeText: "F76808",
			}
		},
	},
	plugins: []
}