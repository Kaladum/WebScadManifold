import { buildDirectory } from "../builder";
import { ResultRenderer } from "../rendering";
import { JsRunner } from "../runtime/runner";

import "./style/index.css";

export async function runModelUi(dir: FileSystemDirectoryHandle) {
    const ui = new ModelUi(dir);
    document.body.append(ui.container);
}

class ModelUi {
    public readonly container = document.createElement("div");

    public readonly renderer = new ResultRenderer();

    public constructor(private readonly dir: FileSystemDirectoryHandle) {
        this.container.classList.add("model-ui");
        this.container.append(this.renderer.container);

        this.init().catch(console.error);//TODO
    }

    private async init() {
        const build = await buildDirectory(this.dir);
        console.log(build);

        const mainResult = await JsRunner.execute(build.contents);
        console.log("Main result", mainResult);
        if (mainResult !== undefined) {
            this.renderer.setContent(mainResult);
        }
    }
}