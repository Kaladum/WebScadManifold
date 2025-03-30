import { WebScadMainResult } from "web-scad-manifold-lib";
import { Child3mf, File3mf, Mesh3mf } from "3mf-lib";
import { iterateResultRecursive } from "../utils/multiObject";

export async function export3mf(result: WebScadMainResult, thumbnail?: HTMLCanvasElement): Promise<Uint8Array> {
    const file = new File3mf();

    file.header.title = "ThisIsATest";
    file.header.application = "web-scad-manifold";

    for (const [obj, _] of iterateResultRecursive(result)) {
        for (const [i, mesh] of obj.meshes.entries()) {
            const id = i + 1;
            file.meshes.push(
                new Mesh3mf(id, mesh.vertices, mesh.indices)
            );

            file.items.push(new Child3mf(id));
        }
    }

    if (thumbnail !== undefined) {
        file.thumbnail = await canvasToPng(thumbnail);
    }

    return file.export();
}

export async function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
    const blob = await toBlobAsync(canvas);
    const u8 = new Uint8Array(await blob.arrayBuffer());
    return u8;
}

function toBlobAsync(canvas: HTMLCanvasElement, type?: string, quality?: number) {
    return new Promise<Blob>((resolve, reject) => {
        try {
            canvas.toBlob(result => {
                if (result !== null) {
                    resolve(result);
                } else {
                    reject(new Error("toBlob generated a null blob"));
                }
            }, type, quality);
        } catch (e) {
            reject(e);
        }
    });
}