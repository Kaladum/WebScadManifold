import { Rect } from "manifold-3d";
import { CrossSectionGc } from "../internal";
import { CrossSection } from "../internal/bindings";

export class Object2D {
	public constructor(
		public readonly crossSection: CrossSectionGc,
	) { }

	public static fromCrossSection = (crossSection: CrossSection) => new Object2D(new CrossSectionGc(crossSection));

	public apply = (operation: (input: CrossSection) => CrossSection): Object2D => {
		return Object2D.fromCrossSection(operation(this.crossSection.internal));
	};

	public readonly bounds = (): Rect => this.crossSection.internal.bounds();
	public readonly isEmpty = (): boolean => this.crossSection.internal.isEmpty();
	public readonly area = (): number => this.crossSection.internal.area();
}
