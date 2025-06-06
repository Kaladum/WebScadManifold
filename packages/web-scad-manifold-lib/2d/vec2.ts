export type SimpleVec2 = readonly [number, number];

export class Vec2 {
	public constructor(
		public readonly x: number,
		public readonly y: number,
	) { }
}

export type AnyVec2 = SimpleVec2 | Vec2;

export function asSimpleVec2(vec2: AnyVec2): SimpleVec2 {
	if (vec2 instanceof Vec2) {
		return [vec2.x, vec2.y];
	} else {
		return vec2;
	}
}
