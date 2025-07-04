import * as esbuild from "esbuild-wasm";
import path from "path-browserify-esm";

const webScadManifoldLibPath = "./web-scad-manifold-lib.js";
const STATIC_RESOLVED_NAMESPACE = "static-resolved";

export function createStaticResolverPlugin(): esbuild.Plugin {
	return {
		name: "StaticResolverPlugin",

		setup: (build: esbuild.PluginBuild) => {
			build.onResolve({ filter: /.*/ }, async (args: esbuild.OnResolveArgs) => {
				if (args.path === "web-scad-manifold-lib") {
					return { path: new URL(webScadManifoldLibPath, window.location.href).toString(), external: true };
				}
				return undefined;
			});

			build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
				if (args.namespace === STATIC_RESOLVED_NAMESPACE) {
					const textContent: string = args.pluginData;
					return { contents: textContent };
				}
				return undefined;
			});
		},
	};
}

const USER_VIRTUAL_FS_NAMESPACE = "user-virtual-fs";

export function createDirectoryHandleResolverPlugin(dir: FileSystemDirectoryHandle): esbuild.Plugin {
	return {
		name: "DirectoryHandleResolverPlugin",

		setup: (build: esbuild.PluginBuild) => {
			build.onResolve({ filter: /.*/ }, async (args: esbuild.OnResolveArgs) => {
				console.log("Resolve", args);
				const filePath = path.resolve(path.dirname(args.importer), args.path);
				const resolved = await resolveCodeFile(dir, filePath);
				if (resolved !== undefined) {
					return { path: resolved.path, namespace: USER_VIRTUAL_FS_NAMESPACE, pluginData: resolved.file };
				}

				return undefined;
			});

			build.onLoad({ filter: /.*/ }, async (args: esbuild.OnLoadArgs) => {
				console.log("Load", args);

				if (args.namespace === USER_VIRTUAL_FS_NAMESPACE) {
					const fileHandle: FileSystemFileHandle = args.pluginData;
					const file = await fileHandle.getFile();
					const text = await file.text();
					let loader: esbuild.Loader | undefined;
					if (args.with.type === "json") {
						loader = "json";
					} else if (args.with.type === "binary") {
						loader = "binary";
					} else if (args.with.type === "text") {
						loader = "text";
					} else if (file.name.endsWith(".ts") || file.name.endsWith(".mts")) {
						loader = "ts";
					} else if (file.name.endsWith(".js") || file.name.endsWith(".mjs")) {
						loader = "js";
					} else {
						throw new Error(`Can't determine loader for file "${file.name}"`);
					}
					return { contents: text, loader };
				}
				return undefined;
			});
		},
	};
}

async function resolveCodeFile(dir: FileSystemDirectoryHandle, path: string): Promise<{ file: FileSystemFileHandle, path: string } | undefined> {
	if (path.startsWith("/")) {
		path = path.substring(1);//Remove first / to prevent empty first result in split
	}
	const pathSegments = path.split("/");
	if (pathSegments.length === 0) {
		return undefined;
	}

	const searchName = pathSegments.pop()!;
	const targetDir = await resolveDir(dir, pathSegments);
	if (targetDir === undefined) return undefined;
	const resolved = await resolveCodeFileInDir(targetDir, searchName);
	if (resolved === undefined) {
		return undefined;
	}
	const { file, fileName } = resolved;
	return { file, path: "/" + pathSegments.join("/") + fileName };
}

async function resolveDir(baseDir: FileSystemDirectoryHandle, pathSegments: readonly string[]) {
	if (pathSegments.length === 0) {
		return baseDir;
	}
	const [dirName, ...childDirs] = pathSegments;

	try {
		const childDirHandle = await baseDir.getDirectoryHandle(dirName);
		return resolveDir(childDirHandle, childDirs);
	} catch (e) {
		console.log(e);
		return undefined;
	}
}

async function resolveCodeFileInDir(dir: FileSystemDirectoryHandle, searchName: string): Promise<{ file: FileSystemFileHandle, fileName: string } | undefined> {
	const entries = await Array.fromAsync(dir.entries());

	for (const fileName of [searchName, searchName + ".js", searchName + ".ts"]) {
		const entry = entries.find(([name, _]) => name === fileName);
		if (entry !== undefined && entry[1].kind === "file") {
			return { file: entry[1], fileName };
		}
	}
}

export const externalResolverPlugin: esbuild.Plugin = {
	name: "ExternalResolverPlugin",
	setup: (build: esbuild.PluginBuild) => {
		build.onResolve({ filter: /.*/ }, async (args: esbuild.OnResolveArgs) => {
			if ([
				"module",
			].indexOf(args.path) >= 0) {
				return { external: true };
			}
			return undefined;
		});
	},
};