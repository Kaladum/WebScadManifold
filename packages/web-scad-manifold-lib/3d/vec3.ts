export type SimpleVec3 = readonly [number, number, number];

export class Vec3 {
	public constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly z: number,
	) { }
}

export type AnyVec3 = SimpleVec3 | Vec3;

// This should return a SimpleVec3 (readonly values). But unfortunately the manifold bindings don't accept that. Therefor i need this small hack.
export function asSimpleVec3(vec3: AnyVec3): [number, number, number] {
	if (vec3 instanceof Vec3) {
		return [vec3.x, vec3.y, vec3.z];
	} else {
		return vec3 as [number, number, number];
	}
}
