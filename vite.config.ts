import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		hmr: {
			overlay: false, // Temporarily disable HMR overlay to avoid error popup
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					"react-vendor": ["react", "react-dom", "react-router-dom"],
					"framer-motion": ["framer-motion"],
				},
			},
		},
	},
});