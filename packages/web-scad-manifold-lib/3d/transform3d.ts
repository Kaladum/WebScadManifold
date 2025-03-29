import { Object3D } from "./object3d";
import { AnyVec3, asSimpleVec3 } from "./vec3";

export const translate3d = (offset: AnyVec3) => (current: Object3D) => {
	return current.applyOnEachManifold(manifold => manifold.translate(asSimpleVec3(offset)));
};

export const rotate3d = (rotation: AnyVec3) => (current: Object3D) => {
	return current.applyOnEachManifold(manifold => manifold.rotate(asSimpleVec3(rotation)));
};

export const mirror3d = (normal: AnyVec3) => (current: Object3D) => {
	return current.applyOnEachManifold(manifold => manifold.mirror(asSimpleVec3(normal)));
};

export const scale3d = (scale: number | AnyVec3) => (current: Object3D) => {
	const innerScale = typeof scale === "number" ? scale : asSimpleVec3(scale);
	return current.applyOnEachManifold(manifold => manifold.scale(innerScale));
};
