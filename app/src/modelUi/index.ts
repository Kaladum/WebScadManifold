import { buildDirectory } from "../builder";
import { ResultRenderer } from "../rendering";
import { JsRunner } from "../runtime/runner";

import { ModelUiControls } from "./controls";
import { ModelCalculationStateManager, ModelStateReady } from "../state";
import { cDiv } from "../utils/jsml";


import "./style/index.css";

export async function runModelUi(dir: FileSystemDirectoryHandle) {
	const ui = new ModelUi(dir, new ModelCalculationStateManager());
	document.body.append(ui.container);
}

class ModelUi {
	protected readonly controls: ModelUiControls;
	public readonly renderer: ResultRenderer;

	public readonly container = cDiv({
		class: ["model-ui"],
	});

	public constructor(
		private readonly dir: FileSystemDirectoryHandle,
		private readonly stateManager: ModelCalculationStateManager,
	) {
		this.renderer = new ResultRenderer();
		this.controls = new ModelUiControls(this.stateManager, this.renderer);
		this.container.append(
			this.renderer.container,
			this.controls.container,
		);

		this.init().catch(console.error);//TODO
	}

	private async init() {
		const build = await buildDirectory(this.dir);
		console.log(build);

		const mainResult = await JsRunner.execute(build.contents);
		console.log("Main result", mainResult);
		if (mainResult !== undefined) {
			this.stateManager.currentState = new ModelStateReady(mainResult);
			this.renderer.setContent(mainResult);
		}
	}
}