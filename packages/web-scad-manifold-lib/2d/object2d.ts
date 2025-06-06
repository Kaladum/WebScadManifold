import { CrossSectionGc } from "../internal";
import { CrossSection } from "../internal/bindings";
import { SimpleVec2 } from "./vec2";

export class Object2D {
	public constructor(
		public readonly crossSection: CrossSectionGc,
	) { }

	public static fromCrossSection = (crossSection: CrossSection) => new Object2D(new CrossSectionGc(crossSection));

	public static fromPolygons(polygons: readonly SimpleVec2[] | readonly SimpleVec2[][], fillRule?: "EvenOdd" | "NonZero" | "Positive" | "Negative"): Object2D {
		const crossSection = new CrossSection(polygons as [number, number][] | [number, number][][], fillRule);
		return Object2D.fromCrossSection(crossSection);
	}

	public apply = (operation: (input: CrossSection) => CrossSection): Object2D => {
		return Object2D.fromCrossSection(operation(this.crossSection.internal));
	};

	public readonly bounds = (): Rect2d => this.crossSection.internal.bounds();
	public readonly isEmpty = (): boolean => this.crossSection.internal.isEmpty();
	public readonly area = (): number => this.crossSection.internal.area();
}

export interface Rect2d {
	min: [number, number],
	max: [number, number],
};