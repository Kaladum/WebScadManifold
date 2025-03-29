export class Material {
	public readonly color?: readonly [number, number, number, number];

	public constructor(color?: readonly [number, number, number] | readonly [number, number, number, number]) {
		if (color !== undefined) {
			if (color.length === 4) {
				this.color = color;
			} else {
				this.color = [...color, 1.0];
			}
		}
	}

	public static readonly default = new Material();
}
