import { build, initialize } from "esbuild-wasm";
import { createDirectoryHandleResolverPlugin, createStaticResolverPlugin, externalResolverPlugin } from "./resolver";

//@ts-ignore
import esbuildWasmUrl from "esbuild-wasm/esbuild.wasm?url";

await initialize({
    wasmURL: esbuildWasmUrl,
});

export async function buildDirectory(dir: FileSystemDirectoryHandle): Promise<BuildResult> {
    const dirResolver = createDirectoryHandleResolverPlugin(dir);

    const result = await build({
        entryPoints: ["/index"],//TODO
        plugins: [
            externalResolverPlugin,
            createStaticResolverPlugin(),
            dirResolver,
        ],
        write: false,
        platform: "browser",
        bundle: true,
        format: "esm",
        sourcemap: "inline",
    });
    console.log(result);

    if (result.errors.length > 0) {
        return { ok: false, errorMessages: result.errors.map(v => v.text) };
    }

    if (result.outputFiles.length === 0) {
        return { ok: false, errorMessages: ["No output files"] };
    }
    if (result.outputFiles.length > 1) {
        return { ok: false, errorMessages: ["To many output files"] };
    }

    const file = result.outputFiles[0];
    return { ok: true, content: file.text, blob: file.contents };
}

export type BuildResult = { ok: true, content: string, blob: Uint8Array } | { ok: false, errorMessages: string[] };