import { expose, proxy } from "comlink";
import { WebScadMainResultInternal, WebScadModule } from "web-scad-manifold-lib";
import { WebScadModuleSchema, WebScadResultSchema } from "./typeCheck";

export class JsRunnerWorker {
	public static async create(content: Uint8Array) {
		let mainModuleRaw: unknown;
		const url = URL.createObjectURL(new Blob([content], { type: "application/javascript" }));
		try {
			mainModuleRaw = await import(/* @vite-ignore */ url);
		} finally {
			URL.revokeObjectURL(url);
		}
		const mainModule = WebScadModuleSchema.parse(mainModuleRaw) as WebScadModule;
		return proxy(new JsRunnerWorker(mainModule));
	}

	public constructor(
		private readonly mainModule: WebScadModule,
	) { }

	public async run(): Promise<WebScadMainResultInternal | undefined> {
		const main = this.mainModule.main;
		const resultRaw = await main();

		const result = WebScadResultSchema.parse(resultRaw) ?? undefined;
		return result;
	}
}

expose(JsRunnerWorker);