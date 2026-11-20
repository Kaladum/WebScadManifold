import { Child3mf, Component3mf, File3mf, Mesh3mf } from "3mf-lib";
import { Matrix4, Object3D, union3d } from "../3d";
import { Mat4 } from "3mf-lib/src/matrix";

export const import3mf = (data: ArrayBuffer): Object3D => {
	const loaded = File3mf.load(new Uint8Array(data));

	const workInProgress = new Set<Mesh3mf | Component3mf | Child3mf>();
	const itemCache = new Map<Mesh3mf | Component3mf | Child3mf, Object3D>();

	const getObjectForItem = (item: Mesh3mf | Component3mf | Child3mf) => {
		{
			const cached = itemCache.get(item);
			if (cached !== undefined) {
				return cached;
			}
		}
		if (workInProgress.has(item)) {
			throw new Error("Circular reference detected");
		}
		workInProgress.add(item);
		let result: Object3D;
		if (item instanceof Mesh3mf) {
			result = Object3D.fromMesh(item.vertices, item.indices);
		} else if (item instanceof Component3mf) {
			const children = item.children.map(v => getObjectForItem(v));
			result = union3d(...children);
		} else if (item instanceof Child3mf) {
			let raw = getObjectForItem(item.object);
			if (item.transform) {
				raw = raw.transform(matrixFromMatrix3mf(item.transform));
			}
			result = raw;
		} else {
			throw new Error("Unsupported item type");
		}
		itemCache.set(item, result);
		return result;
	};

	const resultParts: Object3D[] = loaded.items.map(item => getObjectForItem(item));
	return union3d(...resultParts);
};

const matrixFromMatrix3mf = (raw: Mat4) => {
	return new Matrix4([
		[raw[0], raw[1], raw[2], raw[3]],
		[raw[4], raw[5], raw[6], raw[7]],
		[raw[8], raw[9], raw[10], raw[11]],
		[raw[12], raw[13], raw[14], raw[15]],
	]);
};