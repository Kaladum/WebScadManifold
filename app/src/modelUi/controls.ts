import { export3mf } from "../export/3mf";
import { downloadBlob } from "../export/download";
import { ResultRenderer } from "../rendering";
import { JsRunner } from "../runtime/runner";
import { ModelStateOk } from "../state";
import { cButton, cDiv } from "../utils/jsml";

export class ModelUiControls {
	public readonly container = cDiv({
		class: "controls",
		children: [
			cDiv({
				class: "export",
				children: [
					cButton({ text: "Export 3mf", onClickHandled: () => this.export() }),
				],
			}),
		],
	});

	public constructor(
		private readonly runner: JsRunner,
		private readonly renderer: ResultRenderer,
	) {
	}

	private async export() {
		const state = this.runner.currentState.value;
		if (state instanceof ModelStateOk) {
			const model = state.model;

			if (model !== undefined) {
				const result = await export3mf(model, this.renderer.canvas);
				downloadBlob(result, "my.3mf");
			}
		}
	}
}