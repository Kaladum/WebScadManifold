import { Object3D } from "../3d";
import { Axis } from "../utils/math";
import { Object2D } from "./object2d";
import { AnyVec2, asSimpleVec2, SimpleVec2 } from "./vec2";

export const extrude2d = (current: Object2D, height: number, nDivisions?: number, twistDegrees?: number, scaleTop?: AnyVec2 | number, center?: boolean) => {
	let scaleTopUsed: SimpleVec2 | number | undefined;
	if (scaleTop === undefined) {
		scaleTopUsed = undefined;
	} else if (typeof scaleTop === "number") {
		scaleTopUsed = scaleTop;
	} else {
		scaleTopUsed = asSimpleVec2(scaleTop);
	}
	return Object3D.fromManifold(current.crossSection.internal.extrude(height, nDivisions, twistDegrees, scaleTopUsed, center));
};

export const extrudeLinear2d = (current: Object2D, amount = 1, axis: Axis = "Z", direction: "+" | "-" | "+-" = "+"): Object3D => {
	const extruded = extrude2d(current, amount);

	let moved: Object3D;
	switch (direction) {
		case "+":
			moved = extruded;
			break;
		case "-":
			moved = extruded.translateZ(-amount);
			break;
		case "+-":
			moved = extruded.translateZ(-amount / 2);
			break;
	}

	switch (axis) {
		case "X":
			return moved.mapAxis("YZX");
		case "Y":
			return moved.mapAxis("XZY");
		case "Z":
			return moved;
	}
};

export const extrudeRotational2d = (current: Object2D, axis: Axis, circularSections: number, angleDegrees = 360) => {
	const raw = Object3D.fromManifold(current.crossSection.internal.revolve(circularSections, angleDegrees));
	switch (axis) {
		case "X":
			return raw.mapAxis("YZX");
		case "Y":
			return raw.mapAxis("XZY");
		case "Z":
			return raw;
	}
};