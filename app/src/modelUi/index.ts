import { ResultRenderer } from "../rendering";

import { ModelUiControls } from "./controls";
import { ModelStateOk } from "../state";
import { cDiv } from "../utils/jsml";


import "./style/index.css";
import { JsRunner } from "../runtime/runner";

export async function runModelUi(projectName: string, runner: JsRunner) {
	const ui = new ModelUi(projectName, runner);
	document.body.append(ui.container);
}

class ModelUi {
	protected readonly controls: ModelUiControls;
	public readonly renderer: ResultRenderer;

	public readonly container = cDiv({
		class: ["model-ui"],
	});

	public constructor(
		private readonly projectName: string,
		private readonly runner: JsRunner,
	) {
		this.renderer = new ResultRenderer();
		this.controls = new ModelUiControls(this.projectName, this.runner, this.renderer);
		this.container.append(
			this.renderer.container,
			this.controls.container,
		);

		this.runner.currentState.valueChanged.addListener(state => {
			if (state instanceof ModelStateOk) {
				this.renderer.setContent(state.result.model);
				this.controls.parameterUi.updateParameters(state.result.parameters);
			} else {
				this.renderer.setContent(undefined);
				this.controls.parameterUi.updateParameters(undefined);
			}
		});
	}
}