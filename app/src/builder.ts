import { build, initialize, OutputFile } from "esbuild-wasm";
import { createDirectoryHandleResolverPlugin, createStaticResolverPlugin, externalResolverPlugin } from "./resolver";

//@ts-ignore
import esbuildWasmUrl from "esbuild-wasm/esbuild.wasm?url";

await initialize({
    wasmURL: esbuildWasmUrl,
});

export async function buildDirectory(dir: FileSystemDirectoryHandle): Promise<OutputFile> {
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
        throw new Error(result.errors.map(v => v.text).join("\n"));
    }

    if (result.outputFiles.length === 0) {
        throw new Error("No output files");
    }

    if (result.outputFiles.length > 1) {
        throw new Error("Too many output files");
    }

    const file = result.outputFiles[0];
    return file;
}