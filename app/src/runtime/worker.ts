import { expose, proxy, transfer } from "comlink";
import { MultiValue, Parameter, WebScadObject } from "web-scad-manifold-lib";
import { WebScadModuleSchema, WebScadResultSchema } from "./typeCheck";
import { WebScadRunResult } from "./transfer";
import { iterateMultiValueRecursive } from "../utils/multiObject";
import { ParameterValue, WebScadSingleParameterInternal } from "./type";
import * as z from "zod/v4";
import { parseZodSchemaOrStringError } from "../utils/zod";

//@ts-expect-error This is a virtual URL
import manifoldWasmUrl from "../../../packages/web-scad-manifold-lib/node_modules/manifold-3d/manifold.wasm";

type MainModuleType = z.infer<typeof WebScadModuleSchema>;

export class JsRunnerWorker {
	public static async create(content: Uint8Array) {
		let mainModuleRaw: unknown;
		const url = URL.createObjectURL(new Blob([content.buffer as ArrayBuffer], { type: "application/javascript" }));//Without this cast TS has some DOM vs Node problem
		try {
			mainModuleRaw = await import(url);
		} catch (e) {
			console.log(e);
			throw e;
		} finally {
			URL.revokeObjectURL(url);
		}
		try {
			const mainModule = parseZodSchemaOrStringError(WebScadModuleSchema, mainModuleRaw);
			return proxy(new JsRunnerWorker(mainModule, (mainModuleRaw as MainModuleType)?.parameters));
		} catch (e) {
			console.log(e);
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
			const transferable: Transferable[] = [];

			const addToTransferable = (item: MultiValue<WebScadObject>) => {
				if (item instanceof Uint32Array) {
					transferable.push(item.buffer);
				} else if (item instanceof Float32Array) {
					transferable.push(item.buffer);
				} else if (item instanceof Array) {
					for (const subItem of item) {
						addToTransferable(subItem);
					}
				} else if (item instanceof Object) {
					for (const subItem of Object.values(item)) {
						addToTransferable(subItem);
					}
				};
			};

			if (result !== undefined) {
				addToTransferable(result);
			}

			return transfer({
				model: result,
				parameters: this.mainModule.parameters,
			}, transferable);
		} catch (e) {
			console.log(e);
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

// This is a hack to get the manifold URL to the library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any)["manifold3dWasmImportUrl"] = manifoldWasmUrl;
expose(JsRunnerWorker);