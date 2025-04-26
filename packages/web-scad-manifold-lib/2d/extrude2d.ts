import { Object3D } from "../3d";
import { Object2D } from "./object2d";
import { AnyVec2, asSimpleVec2 } from "./vec2";

export const extrude2d = (height: number, nDivisions?: number, twistDegrees?: number, scaleTop?: AnyVec2 | number, center?: boolean) => (current: Object2D) => {
	let scaleTopUsed: [number, number] | number | undefined;
	if (scaleTop === undefined) {
		scaleTopUsed = undefined;
	} else if (typeof scaleTop === "number") {
		scaleTopUsed = scaleTop;
	} else {
		scaleTopUsed = asSimpleVec2(scaleTop);
	}
	return Object3D.fromManifold(current.crossSection.internal.extrude(height, nDivisions, twistDegrees, scaleTopUsed, center));
};