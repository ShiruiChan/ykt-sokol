import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ isSsrBuild }) => ({
	plugins: [react(), tailwindcss()],
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
