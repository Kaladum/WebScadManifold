/// <reference types="@types/wicg-file-system-access" />

import { PersistentDirectoryHandler, StoredDirectoryHandle } from "../db";
import { cA, cButton, cDiv, cText, uElement } from "../utils/jsml";
import { ResolvablePromise } from "../utils/resolvablePromise";
import { unzip } from "fflate";

//@ts-expect-error CSS module import
import "./style/index.css";

export async function runProjectSelection(dirDb: PersistentDirectoryHandler): Promise<StoredDirectoryHandle> {
	const container = cDiv({
		class: "project-selection",
		children: [
			uElement(document.createElement("h1"), {
				text: "WebScad-Manifold",
			}),
			cDiv({ text: "Please open an existing folder or add a new one." }),
			cDiv({
				children: [
					cText("You can use "),
					cA({ text: "this template", href: "./web-scad-manifold-template.zip" }),
					cText(" to start a new project"),
				],
			}),

		],
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
			cDiv({ text: "Last used: " + formatDate(storedDir.lastUsed) }),
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
				},
			}),
		],
	});
	container.append(
		cButton({
			text: "Add local folder",
			onClickHandled: async () => {
				try {
					const dir = await window.showDirectoryPicker();
					await dirDb.add(dir);
					selectedResult.resolve(undefined);
				} catch (e) {
					console.info(e);//TODO
				}
			},
		}),
		cButton({
			text: "Init new project in local folder",
			onClickHandled: async () => {
				try {
					const dir = await window.showDirectoryPicker({
						mode: "readwrite",
					});
					await initNewProjectInLocalFolder(dir);
					await dirDb.add(dir);
					selectedResult.resolve(undefined);
				} catch (e) {
					alert("Failed to initialize new project: " + e);
					console.info(e);//TODO
				}
			},
		}),
		cDiv({
			class: "project-list",
			children: entries.map(showDirectoryHandle),
		}),
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

const formatDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const initNewProjectInLocalFolder = async (handle: FileSystemDirectoryHandle) => {
	for await (const _ of handle.entries()) {
		throw new Error("Directory is not empty");
	}

	const templateResponse = await fetch("/web-scad-manifold-template.zip");
	const templateArrayBuffer = await templateResponse.arrayBuffer();

	await unzipToDirectory(templateArrayBuffer, handle);
};

async function unzipToDirectory(zip: ArrayBuffer, dirHandle: FileSystemDirectoryHandle) {
	const buffer = new Uint8Array(zip);

	unzip(buffer, async (err, files) => {
		if (err) throw err;

		for (const [path, data] of Object.entries(files)) {
			if (path.endsWith("/")) {
				await createDirectoryPath(dirHandle, path);
				continue;
			}

			const parts = path.split("/");
			const filename = parts.pop()!;
			const parent = await createDirectoryPath(
				dirHandle,
				parts.join("/"),
			);

			const handle = await parent.getFileHandle(filename, {
				create: true,
			});

			const writable = await handle.createWritable();
			await writable.write(data);
			await writable.close();
		}
	});
}

async function createDirectoryPath(root: FileSystemDirectoryHandle, path: string) {
	let current = root;

	for (const part of path.split("/").filter(Boolean)) {
		current = await current.getDirectoryHandle(part, {
			create: true,
		});
	}

	return current;
}