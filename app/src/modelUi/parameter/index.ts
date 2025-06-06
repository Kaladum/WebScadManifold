import { cDiv, uElement } from "../../utils/jsml";
import { WebScadMultiParameterInternal, WebScadNumberParameterInternal, WebScadStringParameterInternal } from "../../runtime/type";
import { JsRunner } from "../../runtime/runner";
import { MultiValuePath } from "../../utils/multiObject";

export class ParameterUi {
	public readonly container = cDiv({
		class: "parameter",
	});

	public updateParameters(parameter: WebScadMultiParameterInternal | undefined) {
		this.container.textContent = "";
		if (parameter !== undefined) {
			this.container.append(createParameterUi(parameter, [], this.runner));
		}
	}

	public constructor(
		public readonly runner: JsRunner,
	) { }
}

function createParameterUi(parameter: WebScadMultiParameterInternal, path: MultiValuePath, runner: JsRunner): HTMLElement {
	if (parameter instanceof Array) {
		return createParameterArrayUi(parameter, path, runner);
	}
	if ("parameterType" in parameter) {
		if (parameter.parameterType === "number") {
			return createNumberParameter(parameter, path, runner);
		}
		if (parameter.parameterType === "string") {
			return createStringParameter(parameter, path, runner);
		}
	}
	if (typeof parameter === "object") {
		return createParameterObjectUi(parameter as Record<string, WebScadMultiParameterInternal>, path, runner);
	}

	throw new Error("Can't process parameter", parameter);
}

const createParameterObjectUi = (parameters: Readonly<Record<string, WebScadMultiParameterInternal>>, path: MultiValuePath, runner: JsRunner) => cDiv({
	class: "object",
	children: Object.entries(parameters).flatMap(([key, child]) => [
		cDiv({ class: "objectKey", text: key }),
		cDiv({ class: "objectValue", children: [createParameterUi(child, [...path, key], runner)] }),
	]),
});

const createParameterArrayUi = (parameters: readonly WebScadMultiParameterInternal[], path: MultiValuePath, runner: JsRunner) => cDiv({
	class: "array",
	children: parameters.flatMap((child, index) => [
		cDiv({ class: "arrayIndex", text: index.toString() }),
		cDiv({ class: "arrayValue", children: [createParameterUi(child, [...path, index], runner)] }),
	]),
});

export function createNumberParameter(parameter: WebScadNumberParameterInternal, path: MultiValuePath, runner: JsRunner): HTMLInputElement {
	return uElement(document.createElement("input"), {
		class: "numberParameter",
		custom: [
			v => {
				v.type = "number";
				const loadedValue = runner.parameters.getValueOrUndefined(path);
				if (typeof loadedValue === "number") {
					v.valueAsNumber = loadedValue;
				} else {
					v.valueAsNumber = parameter.value;
				}

				v.addEventListener("change", () => {
					runner.parameters.setValue(v.valueAsNumber, path);
					runner.requestNewExecution();
				});
			},
		],
	});
}

export function createStringParameter(parameter: WebScadStringParameterInternal, path: MultiValuePath, runner: JsRunner): HTMLInputElement {
	return uElement(document.createElement("input"), {
		class: "stringParameter",
		custom: [
			v => {
				const loadedValue = runner.parameters.getValueOrUndefined(path);
				if (typeof loadedValue === "string") {
					v.value = loadedValue;
				} else {
					v.value = parameter.value;
				}

				v.addEventListener("change", () => {
					runner.parameters.setValue(v.value, path);
					runner.requestNewExecution();
				});
			},
		],
	});
}