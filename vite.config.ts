import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import apiDevPlugin from './scripts/api-dev-plugin.mjs';

const page = (file: string) => fileURLToPath(new URL(file, import.meta.url));

export default defineConfig(({ isSsrBuild }) => ({
	// apiDevPlugin — только для `vite` (dev): функции api/* и /admin локально
	plugins: [react(), tailwindcss(), apiDevPlugin()],
	server: {
		hmr: {
			overlay: false, // Temporarily disable HMR overlay to avoid error popup
		},
	},
	ssr: {
		// CSS-импорты внутри пакета серверной сборке не по зубам — бандлим его
		noExternal: ['react-photo-view'],
	},
	build: {
		rollupOptions: {
			// admin.html — отдельная точка входа: код админки не попадает в чанки сайта
			input: isSsrBuild ? undefined : { main: page('./index.html'), admin: page('./admin.html') },
			// Ручные чанки нужны только клиенту: в серверной сборке react внешний
			output: isSsrBuild
				? {}
				: {
						manualChunks: {
							'react-vendor': ['react', 'react-dom', 'react-router-dom'],
						},
					},
		},
	},
}));
