import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const powerPagesUrl = loadEnv(mode, process.cwd(), "").VITE_POWER_PAGES_URL;

	return {
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(import.meta.dirname, "./src"),
			},
		},
		...(powerPagesUrl && {
			server: {
				proxy: {
					"/_api": {
						target: powerPagesUrl,
						changeOrigin: true,
						secure: true,
					},
				},
			},
		}),
	};
});
