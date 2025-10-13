import { CrossSectionGc } from "../internal";
import { CrossSection } from "../internal/bindings";
import { decompose2d, difference2d, intersect2d, union2d } from "./boolean2d";
import { extrude2d } from "./extrude2d";
import { Matrix3 } from "./matrix";
import { mirror2d, mirrorCopy2d, rotate2d, scale2d, transform2d, translate2d } from "./transform2d";
import { AnyVec2, SimpleVec2 } from "./vec2";

export class Object2D {
	public constructor(
		public readonly crossSection: CrossSectionGc,
	) { }

	public static fromCrossSection = (crossSection: CrossSection) => new Object2D(new CrossSectionGc(crossSection));

	public static fromPolygons(polygons: readonly SimpleVec2[] | readonly SimpleVec2[][], fillRule?: "EvenOdd" | "NonZero" | "Positive" | "Negative"): Object2D {
		const crossSection = new CrossSection(polygons as [number, number][] | [number, number][][], fillRule);
		return Object2D.fromCrossSection(crossSection);
	}

	public readonly applyRaw = (operation: (input: CrossSection) => CrossSection): Object2D => {
		return Object2D.fromCrossSection(operation(this.crossSection.internal));
	};

	public readonly apply = <T>(fn: (item: Object2D) => T) => fn(this);

	public readonly bounds = (): Rect2d => this.crossSection.internal.bounds();
	public readonly isEmpty = (): boolean => this.crossSection.internal.isEmpty();
	public readonly area = (): number => this.crossSection.internal.area();

	public readonly transform = (matrix: Matrix3) => transform2d(this, matrix);
	public readonly translate = (offset: AnyVec2) => translate2d(this, offset);
	public readonly rotate = (rotation: number) => rotate2d(this, rotation);
	public readonly mirror = (normal: AnyVec2) => mirror2d(this, normal);
	public readonly mirrorCopy = (normal: AnyVec2) => mirrorCopy2d(this, normal);
	public readonly scale = (scale: number | AnyVec2) => scale2d(this, scale);

	public readonly difference = (...others: readonly Object2D[]) => difference2d(this, ...others);
	public readonly subtract = (...others: readonly Object2D[]) => this.difference(...others);
	public readonly union = (...others: readonly Object2D[]) => union2d(this, ...others);
	public readonly add = (...others: readonly Object2D[]) => this.union(...others);
	public readonly intersect = (...others: readonly Object2D[]) => intersect2d(this, ...others);
	public readonly decompose = (): Object2D[] => decompose2d(this);

	public readonly extrude = (height: number, nDivisions?: number, twistDegrees?: number, scaleTop?: AnyVec2 | number, center?: boolean) => extrude2d(this, height, nDivisions, twistDegrees, scaleTop, center);
}

export interface Rect2d {
	min: [number, number],
	max: [number, number],
};