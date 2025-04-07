import { wrap } from "comlink";
import { JsRunnerWorker } from "./worker";
import { WebScadMainResultInternal } from "web-scad-manifold-lib";
import { ModelState, ModelStateCompilationFailed, ModelStateExecutionFailed, ModelStateInitializing, ModelStateOk } from "../state";
import { sleep } from "../utils/sleep";
import { buildDirectory } from "../builder";
import { IRProperty, RWProperty } from "../utils/property";
import { OutputFile } from "esbuild-wasm";

// @ts-expect-error This is a virtual URL
import runWorkerUrl from "./worker?url&worker&no-inline";

export async function executeInWorker(content: Uint8Array): Promise<WebScadMainResultInternal | undefined> {
	const rawWorker = new Worker(runWorkerUrl, { type: "module" });
	const jsRunnerWorker = wrap<typeof JsRunnerWorker>(rawWorker);

	try {
		const runtime = await jsRunnerWorker.create(content);
		const result = await runtime.run();
		return result;
	} finally {
		rawWorker.terminate();
	}
}

export class JsRunner {
	private readonly _currentState = new RWProperty<ModelState>(new ModelStateInitializing());
	public readonly currentState: IRProperty<ModelState> = this._currentState;

	private readonly _isWorking = new RWProperty<boolean>(true);
	public readonly isWorking: IRProperty<boolean> = this._isWorking;

	public constructor() {
		this.runner().catch(console.error);
	}

	private codeUpdate: FileSystemDirectoryHandle | undefined = undefined;

	public updateCode(newCode: FileSystemDirectoryHandle) {
		this.codeUpdate = newCode;
		this._isWorking.value = true;
	}

	private async runner(): Promise<void> {
		const buildAndExecute = async (newCode: FileSystemDirectoryHandle) => {
			let build: OutputFile;
			try {
				build = await buildDirectory(newCode);
			} catch (e) {
				this._currentState.value = new ModelStateCompilationFailed(e);
				this._isWorking.value = false;
				return;
			}
			let result: WebScadMainResultInternal | undefined;
			try {
				result = await executeInWorker(build.contents);
			} catch (e) {
				this._currentState.value = new ModelStateExecutionFailed(e);
				this._isWorking.value = false;
				return;
			}
			this._currentState.value = new ModelStateOk(result);
			this._isWorking.value = false;
		};

		while (true) {
			if (this.codeUpdate !== undefined) {
				const newCode = this.codeUpdate;
				this.codeUpdate = undefined;
				await buildAndExecute(newCode);
			}
			await sleep(1_000);
		}
	}
}