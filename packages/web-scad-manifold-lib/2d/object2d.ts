import { CrossSectionGc } from "../internal";
import { CrossSection } from "../internal/bindings";
import { Axis } from "../utils/math";
import { decompose2d, difference2d, intersect2d, union2d } from "./boolean2d";
import { extrude2d, extrudeLinear2d } from "./extrude2d";
import { Matrix3 } from "./matrix";
import { mirror2d, mirrorCopy2d, rotate2d, scale2d, transform2d, translate2d, translateX2d, translateY2d, translateRepeat2d, rotateRepeat2d, rotateAround2d, translateRepeatY2d, translateRepeatX2d } from "./transform2d";
import { AnyVec2, asSimpleVec2, Vec2 } from "./vec2";

export type FillRule = "EvenOdd" | "NonZero" | "Positive" | "Negative";

export class Object2D {
	public constructor(
		public readonly crossSection: CrossSectionGc,
	) { }

	public static fromCrossSection = (crossSection: CrossSection) => new Object2D(new CrossSectionGc(crossSection));

	public static fromPolygon(polygon: readonly AnyVec2[], fillRule?: FillRule): Object2D {
		return Object2D.fromPolygons([polygon], fillRule);
	}

	public static fromPolygons(polygons: readonly (readonly AnyVec2[])[], fillRule?: FillRule): Object2D {
		const data = polygons.map(p => p.map(v => asSimpleVec2(v) as [number, number]));//TODO enable readonly Vec in Manifold
		const crossSection = new CrossSection(data, fillRule);
		return Object2D.fromCrossSection(crossSection);
	}

	public readonly applyRaw = (operation: (input: CrossSection) => CrossSection): Object2D => {
		return Object2D.fromCrossSection(operation(this.crossSection.internal));
	};

	public readonly apply = <T>(fn: (item: Object2D) => T) => fn(this);

	public readonly bounds = (): Rect2d => {
		const bounds = this.crossSection.internal.bounds();
		return new Rect2d(bounds.min, bounds.max);
	};
	public readonly isEmpty = (): boolean => this.crossSection.internal.isEmpty();
	public readonly area = (): number => this.crossSection.internal.area();

	public readonly transform = (matrix: Matrix3) => transform2d(this, matrix);
	public readonly translate = (offset: AnyVec2) => translate2d(this, offset);
	public readonly translateX = (offset: number) => translateX2d(this, offset);
	public readonly translateY = (offset: number) => translateY2d(this, offset);
	public readonly translateRepeat = (offsets: readonly AnyVec2[]) => translateRepeat2d(this, offsets);
	public readonly translateRepeatX = (offsets: readonly number[]) => translateRepeatX2d(this, offsets);
	public readonly translateRepeatY = (offsets: readonly number[]) => translateRepeatY2d(this, offsets);
	public readonly rotate = (rotation: number) => rotate2d(this, rotation);
	public readonly rotateRepeat = (rotations: readonly number[]) => rotateRepeat2d(this, rotations);
	public readonly rotateAround = (point: AnyVec2, rotation: number) => rotateAround2d(this, point, rotation);
	public readonly mirror = (normal: AnyVec2) => mirror2d(this, normal);
	public readonly mirrorCopy = (normal: AnyVec2) => mirrorCopy2d(this, normal);
	public readonly scale = (scale: number | AnyVec2) => scale2d(this, scale);

	public readonly difference = (...others: readonly Object2D[]) => difference2d(this, ...others);
	public readonly subtract = (...others: readonly Object2D[]) => this.difference(...others);
	public readonly union = (...others: readonly Object2D[]) => union2d(this, ...others);
	public readonly add = (...others: readonly Object2D[]) => this.union(...others);
	public readonly intersect = (...others: readonly Object2D[]) => intersect2d(this, ...others);
	public readonly decompose = (): Object2D[] => decompose2d(this);

	//Todo improve options
	public readonly extrude = (height: number, nDivisions?: number, twistDegrees?: number, scaleTop?: AnyVec2 | number, center?: boolean) => extrude2d(this, height, nDivisions, twistDegrees, scaleTop, center);
	public readonly extrudeLinear = (amount = 1, axis: Axis = "Z", direction: "+" | "-" | "+-" = "+") => extrudeLinear2d(this, amount, axis, direction);
}

export class Rect2d {
	public readonly min: Vec2;
	public readonly max: Vec2;

	public constructor(
		min: AnyVec2,
		max: AnyVec2,
	) {
		this.min = Vec2.from(min);
		this.max = Vec2.from(max);
	}

	public readonly size = () => this.max.subtract(this.min);
	public readonly center = () => this.min.add(this.size().scale(0.5));

	public get area() {
		const size = this.size();
		return size.x * size.y;
	}
}