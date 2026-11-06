import { Manifold } from "../internal/bindings";
import { union3d } from "./boolean3d";
import { Matrix4, Matrix4Raw } from "./matrix3d";
import { Object3D } from "./object3d";
import { AnyVec3, asSimpleVec3, Vec3 } from "./vec3";

export const translate3d = (current: Object3D, offset: AnyVec3) => {
	return current.applyOnEachManifold(manifold => manifold.translate(asSimpleVec3(offset)));
};

export const translateX3d = (current: Object3D, offset: number) => {
	return current.applyOnEachManifold(manifold => manifold.translate([offset, 0, 0]));
};

export const translateY3d = (current: Object3D, offset: number) => {
	return current.applyOnEachManifold(manifold => manifold.translate([0, offset, 0]));
};

export const translateZ3d = (current: Object3D, offset: number) => {
	return current.applyOnEachManifold(manifold => manifold.translate([0, 0, offset]));
};

export const translateRepeat3d = (current: Object3D, offsets: readonly AnyVec3[]) => {
	return union3d(...offsets.map(offset => current.translate(offset)));
};

export const translateRepeatX3d = (current: Object3D, offsets: readonly number[]) => {
	return union3d(...offsets.map(offset => current.translateX(offset)));
};

export const translateRepeatY3d = (current: Object3D, offsets: readonly number[]) => {
	return union3d(...offsets.map(offset => current.translateY(offset)));
};

export const translateRepeatZ3d = (current: Object3D, offsets: readonly number[]) => {
	return union3d(...offsets.map(offset => current.translateZ(offset)));
};

export const rotate3d = (current: Object3D, rotation: AnyVec3) => {
	return current.applyOnEachManifold(manifold => manifold.rotate(asSimpleVec3(rotation)));
};

export const rotateX3d = (current: Object3D, rotation: number) => {
	return current.applyOnEachManifold(manifold => manifold.rotate([rotation, 0, 0]));
};

export const rotateY3d = (current: Object3D, rotation: number) => {
	return current.applyOnEachManifold(manifold => manifold.rotate([0, rotation, 0]));
};

export const rotateZ3d = (current: Object3D, rotation: number) => {
	return current.applyOnEachManifold(manifold => manifold.rotate([0, 0, rotation]));
};

export const rotateRepeat3d = (current: Object3D, rotations: readonly AnyVec3[]) => {
	return union3d(...rotations.map(rotation => current.rotate(rotation)));
};

export const rotateRepeatX3d = (current: Object3D, rotations: readonly number[]) => {
	return union3d(...rotations.map(rotation => current.rotateX(rotation)));
};

export const rotateRepeatCircleX3d = (current: Object3D, count: number, offsetItems = 0, offsetDeg = 0) => {
	return rotateRepeatX3d(current, circleRotations(count, offsetItems, offsetDeg));
};

export const rotateRepeatY3d = (current: Object3D, rotations: readonly number[]) => {
	return union3d(...rotations.map(rotation => current.rotateY(rotation)));
};

export const rotateRepeatCircleY3d = (current: Object3D, count: number, offsetItems = 0, offsetDeg = 0) => {
	return rotateRepeatY3d(current, circleRotations(count, offsetItems, offsetDeg));
};

export const rotateRepeatZ3d = (current: Object3D, rotations: readonly number[]) => {
	return union3d(...rotations.map(rotation => current.rotateZ(rotation)));
};

export const rotateRepeatCircleZ3d = (current: Object3D, count: number, offsetItems = 0, offsetDeg = 0) => {
	return rotateRepeatZ3d(current, circleRotations(count, offsetItems, offsetDeg));
};

export const rotateAround3d = (current: Object3D, point: AnyVec3, rotation: AnyVec3) => {
	const offset = Vec3.from(point);
	return current.translate(offset).rotate(rotation).translate(offset.negate());
};

export const mirror3d = (current: Object3D, normal: AnyVec3) => {
	return current.applyOnEachManifold(manifold => manifold.mirror(asSimpleVec3(normal)));
};

export const mirrorCopy3d = (current: Object3D, normal: AnyVec3) => {
	return current.union(
		current.mirror(normal),
	);
};

export const scale3d = (current: Object3D, scale: number | AnyVec3) => {
	const innerScale = typeof scale === "number" ? scale : asSimpleVec3(scale);
	return current.applyOnEachManifold(manifold => manifold.scale(innerScale));
};

export const hull3d = (contents: readonly (Object3D | AnyVec3)[]): Object3D => {
	return Object3D.fromManifold(Manifold.hull(
		contents.map(v => {
			if (v instanceof Object3D) {
				return v.fullManifold.internal;
			} else {
				return asSimpleVec3(v) as [number, number, number];
			}
		}),
	));
};

export const transform3d = (current: Object3D, matrix: Matrix4) => {
	return current.applyOnEachManifold(manifold => manifold.transform(matrix.columnMajor()));
};

export type AxisOrder = "XYZ" | "XZY" | "YXZ" | "YZX" | "ZXY" | "ZYX";

export const mapAxis3d = (current: Object3D, order: AxisOrder) => {
	const indexMap: Record<string, number> = { X: 0, Y: 1, Z: 2 };
	const matrix: Matrix4Raw = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 1],
	];
	for (let i = 0; i < 3; i++) {
		const axis = order[i];
		const index = indexMap[axis];
		matrix[i][index] = 1;
	}
	return transform3d(current, new Matrix4(matrix));
};

const circleRotations = (count: number, offsetItems: number, offsetDeg: number) => {
	const rotations: number[] = [];
	const degPerItem = 360 / count;
	for (let i = 0; i < count; i++) {
		const rotation = (i + offsetItems) * degPerItem + offsetDeg;
		rotations.push(rotation);
	}
	return rotations;
};

//TODO project, slice, translate(mat4), revolve