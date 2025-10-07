export type SimpleVec3 = readonly [number, number, number];

export class Vec3 {
	public constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly z: number,
	) { }

	public readonly xyz = (): [number, number, number] => [this.x, this.y, this.z];

	public equals(b: Vec3) {
		return this.x === b.x && this.y === b.y && this.z === b.z;
	}

	public readonly scale = (factor: number): Vec3 => new Vec3(this.x * factor, this.y * factor, this.z * factor);

	public readonly subtract = (other: Vec3): Vec3 => new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);

	public readonly dot = (other: Vec3): number => this.x * other.x + this.y * other.y + this.z * other.z;

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
