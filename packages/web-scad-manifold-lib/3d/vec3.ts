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

	public readonly add = (other: Vec3): Vec3 => new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
	public readonly subtract = (other: Vec3): Vec3 => new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
	public readonly negate = (): Vec3 => new Vec3(-this.x, -this.y, -this.z);

	public readonly dot = (other: Vec3): number => this.x * other.x + this.y * other.y + this.z * other.z;

	public readonly len = (): number => Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	public readonly lenSqr = (): number => this.x * this.x + this.y * this.y + this.z * this.z;

	public readonly normalize = (): Vec3 => {
		const length = this.len();
		if (length === 0) {
			throw new Error("Cannot normalize a zero-length vector");
		}
		return new Vec3(this.x / length, this.y / length, this.z / length);
	};

	public static fromAToB(a: Vec3, b: Vec3): Vec3 {
		return new Vec3(b.x - a.x, b.y - a.y, b.z - a.z);
	}

	public static from(vec: AnyVec3): Vec3 {
		if (vec instanceof Vec3) {
			return vec;
		} else {
			return new Vec3(...vec);
		}
	}

	public static lerp(a: Vec3, b: Vec3, t: number): Vec3 {
		return new Vec3(
			a.x + (b.x - a.x) * t,
			a.y + (b.y - a.y) * t,
			a.z + (b.z - a.z) * t,
		);
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
