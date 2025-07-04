import { Mat3 } from "manifold-3d";
import { CrossSection } from "../internal/bindings";
import { Matrix3 } from "./matrix";
import { Object2D } from "./object2d";
import { AnyVec2, asSimpleVec2 } from "./vec2";

export const transform2d = (current: Object2D, matrix: Matrix3) => {
	return current.applyRaw(manifold => manifold.transform(matrix.values.flatMap(v => v) as Mat3));
};

export const translate2d = (current: Object2D, offset: AnyVec2) => {
	return current.applyRaw(manifold => manifold.translate(asSimpleVec2(offset)));
};

export const rotate2d = (current: Object2D, rotation: number) => {
	return current.applyRaw(manifold => manifold.rotate(rotation));
};

export const mirror2d = (current: Object2D, normal: AnyVec2) => {
	return current.applyRaw(manifold => manifold.mirror(asSimpleVec2(normal)));
};

export const mirrorCopy2d = (current: Object2D, normal: AnyVec2) => {
	return current.union(
		current.mirror(normal),
	);
};

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