import { buildDirectory } from "./builder";
import { PersistentDirectoryHandler } from "./db";
import { ResultRenderer } from "./rendering";

// @ts-ignore
import runWorkerUrl from "./runtime/worker?url&worker&no-inline";
import { wrap } from "comlink";
import { JsRunnerWorker } from "./runtime/worker";
import { WebScadMainResult } from "web-scad-manifold-lib/common";

async function main() {
    const persistentDirHandler = await PersistentDirectoryHandler.init();

    const loadedDir = await persistentDirHandler.load();
    if (loadedDir !== undefined) {
        loadForDir(loadedDir);
        return;
    }

    const openFolder = document.createElement("button");
    openFolder.textContent = "Open folder";
    openFolder.addEventListener("click", async () => {
        openFolder.remove();
        try {
            const dir = await window.showDirectoryPicker();
            await persistentDirHandler.store(dir);
            await loadForDir(dir);
        } catch (e) {
            console.error(e);//TODO
        }
    });
    document.body.append(openFolder);
}

async function loadForDir(dir: FileSystemDirectoryHandle) {
    const build = await buildDirectory(dir);
    console.log(build);

    if (build.ok) {
        const mainResult = await execute(build.blob);
        console.log("Main result", mainResult);
        if (mainResult !== undefined) {
            render(mainResult);
        }
    }
}

async function execute(content: Uint8Array) {
    const rawWorker = new Worker(runWorkerUrl, { type: "module" });
    const jsRunnerWorker = wrap<typeof JsRunnerWorker>(rawWorker);

    const runtime = await jsRunnerWorker.create(content);

    return await runtime.run();
}

function render(result: WebScadMainResult) {
    const renderer = new ResultRenderer();
    document.body.append(renderer.display);

    renderer.setContent(result);
}

main().catch(console.error);