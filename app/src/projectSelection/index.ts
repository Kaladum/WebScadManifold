import { PersistentDirectoryHandler, StoredDirectoryHandle } from "../db";
import { cButton, cDiv } from "../utils/jsml";
import { ResolvablePromise } from "../utils/resolvablePromise";

import "./style/index.css";

export async function runProjectSelection(dirDb: PersistentDirectoryHandler): Promise<StoredDirectoryHandle> {
    const container = cDiv({
        class: "project-selection",
    });

    document.body.append(container);

    while (true) {
        const entries = await dirDb.getAll();
        const selection = await runSingleProjectSelection(dirDb, container, entries);
        if (selection !== undefined) {
            container.remove();
            return selection;
        }
    }
}

async function runSingleProjectSelection(dirDb: PersistentDirectoryHandler, container: HTMLElement, entries: readonly StoredDirectoryHandle[]): Promise<StoredDirectoryHandle | undefined> {
    const selectedResult = new ResolvablePromise<StoredDirectoryHandle | undefined>();
    const showDirectoryHandle = (storedDir: StoredDirectoryHandle): HTMLElement => cDiv({
        class: "directory-handle",
        children: [
            cDiv({ text: storedDir.handle.name }),
            cButton({
                text: "Open",
                onClickHandled: async () => {
                    if (await tryOpenDirectory(storedDir)) {
                        selectedResult.resolve(storedDir);
                    }
                },
            }),
            cButton({
                text: "Remove",
                onClickHandled: async () => {
                    await dirDb.delete(storedDir.id);
                    selectedResult.resolve(undefined);
                }
            }),
        ]
    });
    container.append(
        cButton({
            text: "Open folder",
            onClickHandled: async () => {
                try {
                    const dir = await window.showDirectoryPicker();
                    await dirDb.add(dir);
                    selectedResult.resolve(undefined);
                } catch (e) {
                    console.info(e);//TODO
                }
            }
        }),
        ...entries.map(showDirectoryHandle)
    );

    const result = await selectedResult;
    container.textContent = "";
    return result;
}

async function tryOpenDirectory(storedDir: StoredDirectoryHandle): Promise<boolean> {
    const permission = await storedDir.handle.queryPermission({ mode: "read" });

    if (permission === "denied") {
        return false;
    }

    if (permission === "prompt") {
        const newPermission = await storedDir.handle.requestPermission({ mode: "read" });
        if (newPermission !== "granted") {
            return false;
        }
    }
    return true;
}