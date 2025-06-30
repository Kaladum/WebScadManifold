import { CrossSection } from "../internal/bindings";
import { pipe } from "../pipe";
import { union2d } from "./boolean2d";
import { Object2D } from "./object2d";
import { AnyVec2, asSimpleVec2 } from "./vec2";

export const translate2d = (offset: AnyVec2) => (current: Object2D) => {
	return current.apply(manifold => manifold.translate(asSimpleVec2(offset)));
};

export const rotate2d = (rotation: number) => (current: Object2D) => {
	return current.apply(manifold => manifold.rotate(rotation));
};

export const mirror2d = (normal: AnyVec2) => (current: Object2D) => {
	return current.apply(manifold => manifold.mirror(asSimpleVec2(normal)));
};

export const mirrorCopy2d = (normal: AnyVec2) => (current: Object2D) => {
	return pipe(
		current,
		mirror2d(normal),
		union2d(current),
	);
};

export const scale2d = (scale: number | AnyVec2) => (current: Object2D) => {
	const innerScale = typeof scale === "number" ? scale : asSimpleVec2(scale);
	return current.apply(manifold => manifold.scale(innerScale));
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