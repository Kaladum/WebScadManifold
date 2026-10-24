import { rangeInclude } from "../utils/math";
import { applyOnPointUnsafe3d, union3d } from "./boolean3d";
import { Object3D } from "./object3d";
import { Vec3 } from "./vec3";

export const bend3d = (shape: Object3D, radius: number, circleSegments: number, direction: "left" | "right" = "left") => {
	const sliceLen = radius * 2 * Math.PI / circleSegments;

	const sliceArcRad = 2 * Math.PI / circleSegments;
	const sliceArcDeg = 360 / circleSegments;
	const sliceSin = Math.sin(sliceArcRad);
	const sliceCos = Math.cos(sliceArcRad);

	const boundingBox = shape.boundingBox();

	if (direction === "left" && (boundingBox.min.x + radius < 0)) {
		throw new Error("Shape extends into negative x-axis (over the bend center), cannot bend safely.");
	}

	if (direction === "right" && (boundingBox.max.x - radius > 0)) {
		throw new Error("Shape extends into positive x-axis (over the bend center), cannot bend safely.");
	}

	const minSlice = Math.floor(boundingBox.min.y / sliceLen);
	const maxSlice = Math.floor(boundingBox.max.y / sliceLen);

	const getSlice = (i: number) => {
		let remaining = shape.trimByPlane([0, -1, 0], -sliceLen * (i + 1));
		remaining = remaining.trimByPlane([0, 1, 0], sliceLen * i);
		return remaining.translate([0, -sliceLen * i, 0]);
	};

	const bendFn = (v: Vec3) => {
		if (direction === "left") {
			const r = v.x + radius;
			const a = new Vec3(r, 0, v.z);
			const b = new Vec3(r * sliceCos, r * sliceSin, v.z);
			return Vec3.lerp(a, b, v.y / sliceLen);
		} else {
			const r = v.x - radius;
			const a = new Vec3(r, 0, v.z);
			const b = new Vec3(r * sliceCos, -r * sliceSin, v.z);
			return Vec3.lerp(a, b, v.y / sliceLen);
		}
	};

	const result = rangeInclude(minSlice, maxSlice).map(i => {
		const slice = getSlice(i);
		const bendSlice = applyOnPointUnsafe3d(slice, bendFn);
		if (direction === "left") {
			return bendSlice.rotateZ(i * sliceArcDeg).translateX(-radius);
		} else {
			return bendSlice.rotateZ(-i * sliceArcDeg).translateX(radius);
		}
	});

	return union3d(...result);
};

export const calculateRadius = (length: number, targetAngleDeg: number): number => {
	return length * 180 / targetAngleDeg / Math.PI;
};