import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react';
import seoPlugin from './scripts/seo-plugin';

export default defineConfig({
	plugins: [react(), tailwindcss(), seoPlugin()],
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