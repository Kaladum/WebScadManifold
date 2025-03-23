import { PersistentDirectoryHandler } from "./db";

import { runModelUi } from "./modelUi";

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
    await runModelUi(dir);
}
// async function loadForDir(dir: FileSystemDirectoryHandle) {
//     const build = await buildDirectory(dir);
//     console.log(build);

//     const mainResult = await execute(build.contents);
//     console.log("Main result", mainResult);
//     if (mainResult !== undefined) {
//         render(mainResult);
//     }
// }

// function render(result: WebScadMainResult) {
//     const renderer = new ResultRenderer();
//     document.body.append(renderer.canvas);

//     renderer.setContent(result);
// }

main().catch(console.error);