import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	define: {
		__BUILD_TIME__: JSON.stringify(new Date().toISOString()),
		__COMMIT_SHA__: JSON.stringify(process?.env?.CF_PAGES_COMMIT_SHA || 'dev'),
		__BRANCH__: JSON.stringify(process?.env?.CF_PAGES_BRANCH || 'local'),
	},
});
