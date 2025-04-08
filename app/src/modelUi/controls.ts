import { export3mf } from "../export/3mf";
import { downloadBlob } from "../export/download";
import { ResultRenderer } from "../rendering";
import { JsRunner } from "../runtime/runner";
import { ModelState, ModelStateCompilationFailed, ModelStateExecutionFailed, ModelStateOk } from "../state";
import { cButton, cDiv, uElement } from "../utils/jsml";

export class ModelUiControls {
	private readonly errorDisplay = uElement<HTMLTextAreaElement>(document.createElement("textarea"), {
		class: "error",
		custom: [
			v => v.readOnly = true,
		],
	});

	private readonly status = cDiv({
		class: ["status", "isWorking"],
		children: [
			cDiv({ class: "spinner" }),
		],
	});

	public readonly container = cDiv({
		class: "controls",
		children: [
			cDiv({
				class: "export",
				children: [
					cButton({ text: "Export 3mf", onClickHandled: () => this.export() }),
				],
			}),
			this.errorDisplay,
			this.status,
		],
	});

	public constructor(
		private readonly runner: JsRunner,
		private readonly renderer: ResultRenderer,
	) {
		this.runner.currentState.valueChanged.addListener(state => this.update(state));
		this.runner.isWorking.valueChanged.addListener(isWorking => this.status.classList.toggle("isWorking", isWorking));
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

	private update(state: ModelState) {
		if (state instanceof ModelStateCompilationFailed) {
			this.errorDisplay.classList.add("hasError");
			this.errorDisplay.textContent = "Build Failed: \n" + String(state.error);
		} else if (state instanceof ModelStateExecutionFailed) {
			this.errorDisplay.classList.add("hasError");
			this.errorDisplay.textContent = "Execution Failed: \n" + String(state.error);
		} else {
			this.errorDisplay.textContent = "";
			this.errorDisplay.classList.remove("hasError");
		}
	}
}