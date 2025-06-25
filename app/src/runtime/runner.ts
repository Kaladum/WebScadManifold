import { Remote, wrap } from "comlink";
import { JsRunnerWorker } from "./worker";
import { ModelState, ModelStateCompilationFailed, ModelStateExecutionFailed, ModelStateInitializing, ModelStateOk } from "../state";
import { sleep } from "../utils/sleep";
import { buildDirectory } from "../builder";
import { IRProperty, RWProperty } from "../utils/property";
import { OutputFile } from "esbuild-wasm";
import { WebScadRunResult } from "./transfer";
import { ParameterStore } from "./type";

export class JsRunnerWorkerController {
	public constructor(
		private readonly rawWorker: Worker,
		private readonly runner: Remote<JsRunnerWorker>,
	) { }

	public static async create(content: Uint8Array): Promise<JsRunnerWorkerController> {
		const rawWorker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
		const jsRunnerWorker = wrap<typeof JsRunnerWorker>(rawWorker);

		try {
			const runner = await jsRunnerWorker.create(content);
			return new JsRunnerWorkerController(
				rawWorker,
				runner,
			);
		} catch (e) {
			rawWorker.terminate();
			throw e;
		}
	}

	public async run(newParameters: ParameterStore): Promise<WebScadRunResult> {
		await this.runner.setParameters(newParameters.serialize());

		return await this.runner.run();
	}

	public terminate() {
		this.rawWorker.terminate();
	}
}

export class JsRunner {
	private readonly _currentState = new RWProperty<ModelState>(new ModelStateInitializing());
	public readonly currentState: IRProperty<ModelState> = this._currentState;

	private readonly _isWorking = new RWProperty<boolean>(true);
	public readonly isWorking: IRProperty<boolean> = this._isWorking;

	public readonly parameters = new ParameterStore();
	private newExecutionRequested = true;

	public constructor() {
		this.runner().catch(console.error);
	}

	private codeUpdate: FileSystemDirectoryHandle | undefined = undefined;

	public updateCode(newCode: FileSystemDirectoryHandle) {
		this.codeUpdate = newCode;
		this.newExecutionRequested = true;
		this._isWorking.value = true;
	}

	public requestNewExecution() {
		this.newExecutionRequested = true;
		this._isWorking.value = true;
	}

	private async runner(): Promise<void> {
		const buildAndLoad = async (newCode: FileSystemDirectoryHandle): Promise<JsRunnerWorkerController | undefined> => {
			let build: OutputFile;
			try {
				build = await buildDirectory(newCode);
			} catch (e) {
				this._currentState.value = new ModelStateCompilationFailed(e);
				this._isWorking.value = false;
				return;
			}
			let workerRunner: JsRunnerWorkerController;
			try {
				workerRunner = await JsRunnerWorkerController.create(build.contents);
				return workerRunner;
			} catch (e) {
				this._currentState.value = new ModelStateExecutionFailed(e);
				this._isWorking.value = false;
				return;
			}
		};

		let workerRunner: JsRunnerWorkerController | undefined;
		while (true) {
			await sleep(500);
			if (this.codeUpdate !== undefined) {
				const newCode = this.codeUpdate;
				this.codeUpdate = undefined;
				workerRunner?.terminate();
				workerRunner = await buildAndLoad(newCode);
			}

			if (workerRunner !== undefined && this.newExecutionRequested) {
				this.newExecutionRequested = false;
				try {
					const result = await workerRunner.run(this.parameters);
					this._currentState.value = new ModelStateOk(result);
				} catch (e) {
					this._currentState.value = new ModelStateExecutionFailed(e);
				}
				this._isWorking.value = false;
			}
		}
	}
}