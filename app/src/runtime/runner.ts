import { wrap } from "comlink";
import { JsRunnerWorker } from "./worker";
import { WebScadMainResultInternal } from "web-scad-manifold-lib";

// @ts-expect-error This is a virtual URL
import runWorkerUrl from "./worker?url&worker&no-inline";

export class JsRunner {
	public static async execute(content: Uint8Array): Promise<WebScadMainResultInternal | undefined> {
		const rawWorker = new Worker(runWorkerUrl, { type: "module" });
		const jsRunnerWorker = wrap<typeof JsRunnerWorker>(rawWorker);

		const runtime = await jsRunnerWorker.create(content);

		const result = await runtime.run();
		rawWorker.terminate();
		return result;
	}
}