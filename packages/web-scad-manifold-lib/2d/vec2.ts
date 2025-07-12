export type SimpleVec2 = readonly [number, number];

export class Vec2 {
	public constructor(
		public readonly x: number,
		public readonly y: number,
	) { }

	public readonly xy = (): [number, number] => [this.x, this.y];

	public static from(vec: AnyVec2): Vec2 {
		if (vec instanceof Vec2) {
			return vec;
		} else {
			return new Vec2(...vec);
		}
	}
}

export type AnyVec2 = SimpleVec2 | Vec2;

export function asSimpleVec2(vec2: AnyVec2): SimpleVec2 {
	if (vec2 instanceof Vec2) {
		return vec2.xy();
	} else {
		return vec2;
	}
}
