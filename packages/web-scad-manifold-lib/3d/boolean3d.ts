import { Manifold } from "../internal/bindings";
import { ManifoldGc } from "../internal/manifoldGc";
import { Material } from "../material";
import { Object3D } from "./object3d";

export const difference3d = (current: Object3D, ...others: readonly Object3D[]) => {
	const allCutAwayManifolds = others.map(v => v.fullManifold.internal);
	const cutAway = Manifold.union(allCutAwayManifolds);

	const result = current.applyOnEachManifold(manifold => manifold.subtract(cutAway));
	cutAway.delete();
	return result;
};

export const union3d = (...items: readonly Object3D[]) => {
	const resultByMaterial = new Map<Material, ManifoldGc>();

	for (const obj of items) {
		for (const [material, manifold] of obj.manifoldsByMaterial) {
			const existingManifold = resultByMaterial.get(material);

			if (existingManifold !== undefined) {
				const newManifold = new ManifoldGc(Manifold.union(existingManifold.internal, manifold.internal));
				resultByMaterial.set(material, newManifold);
			} else {
				resultByMaterial.set(material, manifold);
			}
		}
	}

	return new Object3D(resultByMaterial);
};


export const autoUnion3d = (value: Object3D | readonly Object3D[]) => {
	if (value instanceof Array) {
		if (value.length === 0) return value[0];
		return union3d(...value);
	} else {
		return value;
	}
};

export const intersect3d = (current: Object3D, ...others: readonly Object3D[]) => {
	const finalShape = Manifold.intersection([current, ...others].map(v => v.fullManifold.internal));
	const result = current.applyOnEachManifold(manifold => manifold.intersect(finalShape));
	finalShape.delete();
	return result;
};

export const decompose3d = (current: Object3D): Object3D[] => {
	const decomposed = current.fullManifold.internal.decompose();
	const result = decomposed.map(partialManifold => current.applyOnEachManifold(originalManifold => originalManifold.intersect(partialManifold)));
	for (const manifold of decomposed) {
		manifold.delete();
	}
	return result;
};

//TODO split,splitByPlane,trimByPlane,compose