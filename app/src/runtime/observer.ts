import { JsRunner } from "./runner";

export function runDirectoryObservation(dir: FileSystemDirectoryHandle, runner: JsRunner) {
	if (!("FileSystemObserver" in window)) {
		console.warn("Your browser doesn't support the FileSystemObserver. Changes in code can't be detected.");
		return;
	}

	const observer = new FileSystemObserver((_records) => {
		runner.updateCode(dir);
	});

	observer.observe(dir);
}

//This is only a stub. Use @types when available.
declare class FileSystemObserver {
	constructor(callback: (records: unknown) => void);

	public observe(handle: FileSystemDirectoryHandle): void;
}