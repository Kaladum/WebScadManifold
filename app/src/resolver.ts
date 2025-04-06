import * as esbuild from "esbuild-wasm";
import path from "path-browserify-esm";

// @ts-expect-error This is a virtual URL
import webScadManifoldLibPath from "web-scad-manifold-lib?url&worker&no-inline";

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
					return { contents: text, loader: "ts" };
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
	try {
		const fileName = searchName;
		const file = await dir.getFileHandle(fileName);
		return { file, fileName };
	} catch (_) { }
	try {
		const fileName = searchName + ".js";
		const file = await dir.getFileHandle(fileName);
		return { file, fileName };
	} catch (_) { }
	try {
		const fileName = searchName + ".ts";
		const file = await dir.getFileHandle(fileName);
		return { file, fileName };
	} catch (_) { }
	return undefined;
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