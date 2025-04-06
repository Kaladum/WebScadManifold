import { defineConfig } from "vite";

export default defineConfig({
	build: {
		target: "esnext",
		modulePreload: false,
	},
	worker: {
		format: "es",
	},
});