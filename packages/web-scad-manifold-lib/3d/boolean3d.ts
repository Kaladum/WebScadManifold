import { Manifold } from "../internal/bindings";
import { ManifoldGc } from "../internal/manifoldGc";
import { Material } from "../material";
import { Object3D } from "./object3d";
import { AnyVec3, asSimpleVec3, Vec3 } from "./vec3";

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

export const splitByPlane3d = (current: Object3D, planeNormal: AnyVec3, planeOffset: number): readonly [Object3D, Object3D] => {
	const normal = asSimpleVec3(planeNormal);
	const resultA = new Map<Material, ManifoldGc>();
	const resultB = new Map<Material, ManifoldGc>();
	for (const [material, manifold] of current.manifoldsByMaterial) {
		const [sideA, sideB] = manifold.internal.splitByPlane(normal, planeOffset);
		resultA.set(material, new ManifoldGc(sideA));
		resultB.set(material, new ManifoldGc(sideB));
	}
	return [new Object3D(resultA), new Object3D(resultB)];
};

export const splitByObject3d = (current: Object3D, other: Object3D): readonly [Object3D, Object3D] => {
	const resultA = new Map<Material, ManifoldGc>();
	const resultB = new Map<Material, ManifoldGc>();
	for (const [material, manifold] of current.manifoldsByMaterial) {
		const [sideA, sideB] = manifold.internal.split(other.fullManifold.internal);
		resultA.set(material, new ManifoldGc(sideA));
		resultB.set(material, new ManifoldGc(sideB));
	}
	return [new Object3D(resultA), new Object3D(resultB)];
};

export const trimByPlane3d = (current: Object3D, planeNormal: AnyVec3, planeOffset: number): Object3D => {
	return current.applyOnEachManifold(manifold => manifold.trimByPlane(asSimpleVec3(planeNormal), planeOffset));
};

export const applyOnPointUnsafe3d = (current: Object3D, fn: (vec: Vec3) => AnyVec3) => {
	const result = current.applyOnEachManifold(manifold => manifold.warp(v => {
		const result = Vec3.from(fn(Vec3.from(v)));
		// Apply the result back to the original vector (I don't like mutating in place)
		v[0] = result.x;
		v[1] = result.y;
		v[2] = result.z;
	}));
	return result;
};