export type SimpleVec3 = readonly [number, number, number];

export class Vec3 {
	public constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly z: number,
	) { }

	public readonly xyz = (): [number, number, number] => [this.x, this.y, this.z];

	public static from(vec: AnyVec3): Vec3 {
		if (vec instanceof Vec3) {
			return vec;
		} else {
			return new Vec3(...vec);
		}
	}
}

export type AnyVec3 = SimpleVec3 | Vec3;

export function asSimpleVec3(vec3: AnyVec3): SimpleVec3 {
	if (vec3 instanceof Vec3) {
		return vec3.xyz();
	} else {
		return vec3;
	}
}
