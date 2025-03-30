import { wrap } from "comlink";
import { JsRunnerWorker } from "./worker";

// @ts-ignore
import runWorkerUrl from "./worker?url&worker&no-inline";
import { WebScadMainResult } from "web-scad-manifold-lib";

export class JsRunner {
    public static async execute(content: Uint8Array): Promise<WebScadMainResult | undefined> {
        const rawWorker = new Worker(runWorkerUrl, { type: "module" });
        const jsRunnerWorker = wrap<typeof JsRunnerWorker>(rawWorker);

        const runtime = await jsRunnerWorker.create(content);

        const result = await runtime.run();
        rawWorker.terminate();
        return result;
    }
}