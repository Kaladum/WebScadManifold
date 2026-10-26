import { WebScadMainResultInternal } from "web-scad-manifold-lib";
import { Child3mf, File3mf, Mesh3mf } from "3mf-lib";
import { iterateResultRecursive } from "../utils/multiObject";

export async function export3mf(result: WebScadMainResultInternal, title: string, thumbnail?: HTMLCanvasElement): Promise<Uint8Array> {
	const file = new File3mf();

	file.header.title = title;
	file.header.application = "web-scad-manifold";

	let nextId = 1;
	let nextColorIndex = 0;

	// Reserve a resource id for the base materials; object and material ids share one namespace.
	const materialsId = nextId++;

	const usedColors: string[] = [];

	for (const [obj, _] of iterateResultRecursive(result)) {
		for (const mesh of obj.meshes) {
			const id = nextId++;
			const color = mesh.color;
			const resultMesh = new Mesh3mf(id, mesh.vertices, mesh.indices);
			if (color !== undefined) {
				usedColors.push(colorToHex(color));
				resultMesh["@_pid"] = materialsId;
				resultMesh["@_pindex"] = nextColorIndex;
				nextColorIndex++;
			}
			file.meshes.push(
				resultMesh,
			);
			file.items.push(new Child3mf(id));
		}
	}

	if (usedColors.length > 0) {
		file.basematerials.push({
			"@_id": materialsId,
			base: usedColors.map(v => ({
				"@_name": "",
				"@_displaycolor": v,
			})),
		});
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

function colorToHex(color: readonly [number, number, number] | readonly [number, number, number, number]): string {
	const r = Math.max(0, Math.min(255, Math.floor(color[0] * 255)));
	const g = Math.max(0, Math.min(255, Math.floor(color[1] * 255)));
	const b = Math.max(0, Math.min(255, Math.floor(color[2] * 255)));
	let a: number | undefined = undefined;
	if (color.length === 4) {
		a = Math.max(0, Math.min(255, Math.floor(color[3] * 255)));
	}
	return "#" + [
		r.toString(16).padStart(2, "0"),
		g.toString(16).padStart(2, "0"),
		b.toString(16).padStart(2, "0"),
		...(a !== undefined ? [a.toString(16).padStart(2, "0")] : []),
	].join("").toUpperCase();
}