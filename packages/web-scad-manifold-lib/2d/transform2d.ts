import { Mat3 } from "manifold-3d";
import { CrossSection } from "../internal/bindings";
import { Matrix3 } from "./matrix2d";
import { Object2D } from "./object2d";
import { AnyVec2, asSimpleVec2, Vec2 } from "./vec2";
import { union2d } from "./boolean2d";

export const transform2d = (current: Object2D, matrix: Matrix3) => {
	return current.applyRaw(manifold => manifold.transform(matrix.values.flatMap(v => v) as Mat3));
};

export const translate2d = (current: Object2D, offset: AnyVec2) => {
	return current.applyRaw(manifold => manifold.translate(asSimpleVec2(offset)));
};

export const translateX2d = (current: Object2D, offset: number) => {
	return current.applyRaw(manifold => manifold.translate([offset, 0]));
};

export const translateY2d = (current: Object2D, offset: number) => {
	return current.applyRaw(manifold => manifold.translate([0, offset]));
};

export const translateRepeat2d = (current: Object2D, offsets: readonly AnyVec2[]) => {
	return union2d(...offsets.map(offset => current.translate(offset)));
};

export const translateRepeatX2d = (current: Object2D, offsets: readonly number[]) => {
	return union2d(...offsets.map(offset => current.translateX(offset)));
};

export const translateRepeatY2d = (current: Object2D, offsets: readonly number[]) => {
	return union2d(...offsets.map(offset => current.translateY(offset)));
};

export const rotate2d = (current: Object2D, rotation: number) => {
	return current.applyRaw(manifold => manifold.rotate(rotation));
};

export const rotateRepeat2d = (current: Object2D, rotations: readonly number[]) => {
	return union2d(...rotations.map(rotation => current.rotate(rotation)));
};

export const rotateCircle2d = (current: Object2D, count: number, offsetItems = 0, offsetDeg = 0) => {
	return rotateRepeat2d(current, circleRotations(count, offsetItems, offsetDeg));
};

export const rotateAround2d = (current: Object2D, point: AnyVec2, rotation: number) => {
	const offset = Vec2.from(point);
	return current.translate(offset).rotate(rotation).translate(offset.negate());
};

export const rotateAroundRepeat2d = (current: Object2D, point: AnyVec2, rotations: number[]) => {
	const offset = Vec2.from(point);
	return current.translate(offset).rotateRepeat(rotations).translate(offset.negate());
};

export const mirror2d = (current: Object2D, normal: AnyVec2) => {
	return current.applyRaw(manifold => manifold.mirror(asSimpleVec2(normal)));
};

export const mirrorX2d = (current: Object2D) => {
	return current.applyRaw(manifold => manifold.mirror([1, 0]));
};

export const mirrorY2d = (current: Object2D) => {
	return current.applyRaw(manifold => manifold.mirror([0, 1]));
};

export const mirrorCopy2d = (current: Object2D, normal: AnyVec2) => {
	return current.union(
		current.mirror(normal),
	);
};

export const mirrorCopyX2d = (current: Object2D) => mirrorCopy2d(current, [1, 0]);
export const mirrorCopyY2d = (current: Object2D) => mirrorCopy2d(current, [0, 1]);

export const scale2d = (current: Object2D, scale: number | AnyVec2) => {
	const innerScale = typeof scale === "number" ? scale : asSimpleVec2(scale);
	return current.applyRaw(manifold => manifold.scale(innerScale));
};

export const hull2d = (contents: readonly (Object2D | AnyVec2)[]): Object2D => {
	return Object2D.fromCrossSection(CrossSection.hull(
		contents.map(v => {
			if (v instanceof Object2D) {
				return v.crossSection.internal;
			} else {
				return [asSimpleVec2(v) as [number, number]];
			}
		}),
	));
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