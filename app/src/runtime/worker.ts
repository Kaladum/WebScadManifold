import { expose, proxy } from "comlink";
import { MultiValue, Parameter } from "web-scad-manifold-lib";
import { WebScadModuleSchema, WebScadResultSchema } from "./typeCheck";
import { WebScadRunResult } from "./transfer";
import { iterateMultiValueRecursive } from "../utils/multiObject";
import { ParameterValue, WebScadSingleParameterInternal } from "./type";
import * as z from "zod/v4";
import { parseZodSchemaOrStringError } from "../utils/zod";

type MainModuleType = z.infer<typeof WebScadModuleSchema>;

export class JsRunnerWorker {
	public static async create(content: Uint8Array) {
		let mainModuleRaw: unknown;
		const url = URL.createObjectURL(new Blob([content], { type: "application/javascript" }));
		try {
			mainModuleRaw = await import(/* @vite-ignore */ url);//TODO type module?
		} finally {
			URL.revokeObjectURL(url);
		}
		try {
			const mainModule = parseZodSchemaOrStringError(WebScadModuleSchema, mainModuleRaw);
			return proxy(new JsRunnerWorker(mainModule, (mainModuleRaw as MainModuleType)?.parameters));
		} catch (e) {
			throw new Error(String(e));//Make sure, that the error is transferable
		}
	}

	public constructor(
		private readonly mainModule: MainModuleType,
		private readonly parametersRaw: unknown,
	) { }

	public async run(): Promise<WebScadRunResult> {
		try {
			const resultRaw = await this.mainModule.main();

			const result = parseZodSchemaOrStringError(WebScadResultSchema, resultRaw) ?? undefined;
			return {
				model: result,
				parameters: this.mainModule.parameters,
			};
		} catch (e) {
			throw new Error(String(e));//Make sure, that the error is transferable
		}
	}

	public setParameters(parameters: ReadonlyMap<string, ParameterValue>) {
		try {//It is necessary to use the parametersRaw because trySetValue has been removed from the parsed parameters to make it serializable
			if (this.parametersRaw === undefined) {
				return;
			}
			for (const [parameter, path] of iterateMultiValueRecursive(this.parametersRaw as MultiValue<WebScadSingleParameterInternal>, (v): v is WebScadSingleParameterInternal => {
				return ("isParameter" in v && v.isParameter === true);
			})) {
				try {
					const value = parameters.get(JSON.stringify(path));
					if (value !== undefined) {
						(parameter as Parameter).trySetValue(value);
					}
				} catch (e) {
					console.warn(e);
				}
			}
		} catch (e) {
			console.warn(e);
		}
	}
}

expose(JsRunnerWorker);