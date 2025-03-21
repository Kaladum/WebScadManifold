import { Mesh } from "web-scad-manifold-lib";
import { buildDirectory } from "./builder";
import { PersistentDirectoryHandler } from "./db";
import { ResultRenderer } from "./rendering";

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
            loadForDir(dir);
        } catch (e) {
            console.error(e);//TODO
        }
    });
    document.body.append(openFolder);
}

async function loadForDir(dir: FileSystemDirectoryHandle) {
    console.log(dir);

    const build = await buildDirectory(dir);
    console.log(build);

    if (build.ok) {
        const fileContent = build.content;
        const url = URL.createObjectURL(new Blob([build.blob], { type: "application/javascript" }));
        //const url = "data:application/javascript;base64," + btoa(fileContent);

        const result = await import(/* @vite-ignore */ url);
        console.log(result);

        const mainResult = await result.main();
        console.log(mainResult);

        render(mainResult);
    }
}

function render(result: Mesh) {
    const renderer = new ResultRenderer();
    document.body.append(renderer.display);

    renderer.setContent(result);
}

main().catch(console.error);