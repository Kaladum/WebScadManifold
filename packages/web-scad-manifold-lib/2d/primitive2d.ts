import { CrossSection } from "../internal/bindings";
import { distribute1d } from "../utils/math";
import { Object2D } from "./object2d";
import { AnyVec2, asSimpleVec2 } from "./vec2";

export const square = (size?: AnyVec2, center?: boolean) => Object2D.fromCrossSection(CrossSection.square(asSimpleVec2(size ?? [1, 1]), center));
export const circle = (radius = 1, circularSegments?: number) => Object2D.fromCrossSection(CrossSection.circle(radius, circularSegments));
export const ring = (outerRadius = 2, innerRadius = 1, circularSegments?: number) => circle(outerRadius, circularSegments).subtract(circle(innerRadius, circularSegments));

export const arc = (radius = 1, startAngle = 0, endAngle = 360, circularSegments = 60) => {
	if (radius <= 0) throw new Error("Radius must be greater than 0");
	return Object2D.fromPolygon([
		[0, 0],
		...distribute1d(startAngle, endAngle, circularSegments, false).map(
			v => [radius * Math.cos(v * Math.PI / 180), radius * Math.sin(v * Math.PI / 180)] as const,
		),
	]);
};

export const outerArc = (outerRadius = 2, innerRadius = 1, startAngle = 0, endAngle = 360, circularSegments?: number) => {
	const outer = arc(outerRadius, startAngle, endAngle, circularSegments);
	const inner = circle(innerRadius, circularSegments);
	return outer.subtract(inner);
};

export const triangle = (p1: AnyVec2, p2: AnyVec2, p3: AnyVec2) => Object2D.fromPolygon([p1, p2, p3]);