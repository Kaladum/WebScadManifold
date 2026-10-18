export type RGBColor = readonly [number, number, number];
export type RGBAColor = readonly [number, number, number, number];

export class Material {
	public readonly color?: RGBAColor;

	public constructor(color?: RGBColor | RGBAColor) {
		if (color !== undefined) {
			for (const element of color) {
				if (element < 0 || element > 1) throw new Error("Color values must be between 0 and 1");
			}
			if (color.length === 4) {
				this.color = color;
			} else {
				this.color = [...color, 1.0] as RGBAColor;
			}
		}
	}

	public static readonly default = new Material();
}
