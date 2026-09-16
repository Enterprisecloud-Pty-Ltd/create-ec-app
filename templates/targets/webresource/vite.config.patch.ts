import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
	const isDev = mode === "development" || command === "serve";

	return {
		base: "./",
		plugins: [react(), tailwindcss()],
		resolve: {
			alias: {
				"@": path.resolve(import.meta.dirname, "./src"),
			},
		},
		build: {
			rollupOptions: {
				external: ["../../token.json"],
				output: {
					manualChunks: undefined,
					entryFileNames: "[name].js",
					chunkFileNames: "[name].chunk.js",
					assetFileNames: (assetInfo) => {
						if (assetInfo.name?.endsWith(".css")) {
							return "main.css";
						}
						return "[name].[ext]";
					},
				},
			},
			minify: !isDev,
			mode: isDev ? "development" : "production",
			assetsDir: "",
			target: "es2015",
			cssCodeSplit: false,
		},
	};
});

