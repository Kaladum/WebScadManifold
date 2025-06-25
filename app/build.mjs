// @ts-check

import * as esbuild from "esbuild";
import http from "node:http";
import * as fs from "fs/promises";

const production = process.argv.includes("--production");
const serve = process.argv.includes("--serve");
import { archiveFolder } from "zip-lib";

//reset dist
await fs.rm("./dist", { recursive: true }).catch(() => undefined);

//Copy index.html
await fs.mkdir("./dist");
await fs.copyFile("index.html", "dist/index.html");


//Create template folders
await fs.mkdir("../projectTemplate/types").catch(() => false);
await fs.mkdir("../projectTemplate/types/manifold-3d").catch(() => false);

//Copy web-scad-manifold-lib definitions
await fs.copyFile("../packages/web-scad-manifold-lib/dist/web-scad-manifold-lib.d.ts", "../projectTemplate/types/web-scad-manifold-lib.d.ts");

//Copy manifold-3d definitions
await fs.copyFile("../node_modules/manifold-3d/manifold.d.ts", "../projectTemplate/types/manifold-3d/manifold.d.ts");
await fs.copyFile("../node_modules/manifold-3d/manifold-global-types.d.ts", "../projectTemplate/types/manifold-3d/manifold-global-types.d.ts");
await fs.copyFile("../node_modules/manifold-3d/manifold-encapsulated-types.d.ts", "../projectTemplate/types/manifold-3d/manifold-encapsulated-types.d.ts");

//create template zip
await archiveFolder("../projectTemplate", "./dist/web-scad-manifold-template.zip");

/**
 * @type {esbuild.BuildOptions}
 */
const options = {
	platform: "browser",
	entryPoints: {
		"index": "./src/index.ts",
		"worker": "./src/runtime/worker.ts",
		"web-scad-manifold-lib": "./src/web-scad-manifold-lib-entry-point.ts",
	},
	format: "esm",
	bundle: true,
	outdir: "dist",
	loader: {
		".wasm": "file",
	},
	external: [
		"module",
	],
	minify: production,
	sourcemap: !production ? "external" : undefined,
	treeShaking: true,
};

if (serve) {
	const ctx = await esbuild.context(options);

	let { hosts, port } = await ctx.serve({ servedir: "dist" });

	// Then start a proxy server on port 3000
	http.createServer((req, res) => {
		const options = {
			hostname: hosts[0],
			port: port,
			path: req.url,
			method: req.method,
			headers: req.headers,
		};

		// Forward each incoming request to esbuild
		const proxyReq = http.request(options, proxyRes => {
			// If esbuild returns "not found", send a custom 404 page
			if (proxyRes.statusCode === 404) {
				res.writeHead(404, { "Content-Type": "text/html" });
				res.end("<h1>A custom 404 page</h1>");
				return;
			}

			// Otherwise, forward the response from esbuild to the client
			res.writeHead(proxyRes.statusCode, proxyRes.headers);
			proxyRes.pipe(res, { end: true });
		});

		// Forward the body of the request to esbuild
		req.pipe(proxyReq, { end: true });
	}).listen(3000);
	console.log("Server is running on http://localhost:3000");
} else {
	await esbuild.build(options);
}
