import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
	esbuild: {
		target: 'esnext',
	},
	optimizeDeps: {
		esbuildOptions: {
			target: 'esnext',
		},
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				landing: resolve(__dirname, 'landing.html'),
			},
		},
	},
	css: {
		postcss: {
			plugins: [
				tailwindcss({
					content: [
						"./index.html",
						"./main.js",
						"./src/**/*.{js,ts,jsx,tsx}",
					],
					theme: {
						extend: {
							colors: {
								background: '#f8f9fa',
								sidebar: '#ffffff',
							},
							fontFamily: {
								sans: ['Outfit', 'sans-serif'],
								serif: ['"Playfair Display"', 'serif'],
								mono: ['"Fira Code"', 'monospace'],
								poster: ['Outfit', 'sans-serif'],
							}
						},
					},
				}),
				autoprefixer(),
			],
		},
	}
});
