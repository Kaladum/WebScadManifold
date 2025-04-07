import { PersistentDirectoryHandler } from "./db";

import { runModelUi } from "./modelUi";
import { runProjectSelection } from "./projectSelection";
import { removeLastUsedDirReference, setLastUsedDirReference, tryOpenLastUsedDir } from "./projectSelection/lastOption";
import { JsRunner } from "./runtime/runner";

async function main() {
	const persistentDirHandler = await PersistentDirectoryHandler.init();

	const lastUsedDir = await tryOpenLastUsedDir(persistentDirHandler);
	if (lastUsedDir !== undefined) {
		await loadForDir(lastUsedDir.handle);
		return;
	} else {
		removeLastUsedDirReference();
	}

	const selection = await runProjectSelection(persistentDirHandler);
	setLastUsedDirReference(selection.id);
	await loadForDir(selection.handle);
}

async function loadForDir(dir: FileSystemDirectoryHandle) {
	const runner = new JsRunner();
	runner.updateCode(dir);
	await runModelUi(runner);
}

main().catch(console.error);