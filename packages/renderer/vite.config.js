/* eslint-env node */

import { chrome } from '../../electron-vendors.config.json';
import { join } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import { loadAndSetEnv } from '../../scripts/loadAndSetEnv.mjs';

const PACKAGE_ROOT = __dirname;

/**
 * Vite looks for `.env.[mode]` files only in `PACKAGE_ROOT` directory.
 * Therefore, you must manually load and set the environment variables from the root directory above
 */
loadAndSetEnv(process.env.MODE, process.cwd());

/**
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
	root: PACKAGE_ROOT,
	resolve: {
		alias: {
			'@/': join(PACKAGE_ROOT, 'src') + '/',
		},
	},
	plugins: [vue(), svgLoader()],
	base: '',
	build: {
		sourcemap: true,
		target: `chrome${chrome}`,
		polyfillDynamicImport: false,
		outDir: 'dist',
		assetsDir: '.',
		minify: true,
		terserOptions: {
			ecma: 2020,
			compress: true,
			safari10: false,
		},
		// i don't think this was right:
		// rollupOptions: {
		// external: [...builtinModules],
		// },
		// i mean, the built in modules aren't available to the renderer
		// + was breaking build
		emptyOutDir: true,
	},
});
