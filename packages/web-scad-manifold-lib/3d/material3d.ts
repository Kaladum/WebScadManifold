import { Object3D } from "./object3d";
import { Material } from "../material";
import { ManifoldGc } from "../internal";

export const setMaterial3d = (obj: Object3D, material: Material) => Object3D.fromManifoldGc(obj.fullManifold, material);

export const replaceMaterial3d = (obj: Object3D, newMaterial: Material, oldMaterial = Material.default) => {
	const resultByMaterial = new Map(obj.manifoldsByMaterial);
	const oldManifold = resultByMaterial.get(oldMaterial);
	if (oldManifold) {
		resultByMaterial.delete(oldMaterial);
		const newManifold = resultByMaterial.get(newMaterial);
		if (newManifold !== undefined) {
			const combinedManifold = new ManifoldGc(oldManifold.internal.add(newManifold.internal));
			resultByMaterial.set(newMaterial, combinedManifold);
		} else {
			resultByMaterial.set(newMaterial, oldManifold);
		}
	}
	return new Object3D(resultByMaterial);
};
