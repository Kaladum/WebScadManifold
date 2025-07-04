import { export3mf } from "../export/3mf";
import { downloadBlob } from "../export/download";
import { removeLastUsedDirReference } from "../projectSelection/lastOption";
import { ResultRenderer } from "../rendering";
import { JsRunner } from "../runtime/runner";
import { ModelState, ModelStateCompilationFailed, ModelStateExecutionFailed, ModelStateOk } from "../state";
import { cButton, cDiv, uElement } from "../utils/jsml";
import { ParameterUi } from "./parameter";

export class ModelUiControls {
	public readonly parameterUi: ParameterUi;

	private readonly errorDisplay = uElement<HTMLTextAreaElement>(document.createElement("textarea"), {
		class: "error",
		custom: [
			v => v.readOnly = true,
		],
	});

	private readonly header = cDiv({
		class: "header",
		children: [
			cButton({
				text: "Close",
				onClickHandled: () => {
					removeLastUsedDirReference();
					window.location.reload();
				},
			}),
		],
	});

	private readonly status: HTMLDivElement;

	public readonly container: HTMLDivElement;

	public constructor(
		private readonly projectName: string,
		private readonly runner: JsRunner,
		private readonly renderer: ResultRenderer,
	) {
		this.parameterUi = new ParameterUi(this.runner);

		this.status = cDiv({
			class: ["status", "isWorking"],
			children: [
				cDiv({ class: "spinner" }),
				cDiv({
					text: `SpeedExp: ${this.renderer.controls.state.speedExp.value}`,
					custom: [
						v => {
							this.renderer.controls.state.speedExp.valueChanged.addListener(value => v.textContent = `SpeedExp: ${value}`);
						},
					],
				}),
			],
		});

		this.container = cDiv({
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
				this.parameterUi.container,
				this.header,
			],
		});

		this.runner.currentState.valueChanged.addListener(state => this.update(state));
		this.runner.isWorking.valueChanged.addListener(isWorking => this.status.classList.toggle("isWorking", isWorking));
	}

	private async export() {
		const state = this.runner.currentState.value;
		if (state instanceof ModelStateOk) {
			const model = state.result.model;

			if (model !== undefined) {
				const result = await export3mf(model, this.projectName, this.renderer.canvas);
				downloadBlob(result, this.projectName + ".3mf");
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