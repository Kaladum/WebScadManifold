import { AnyVec3, asSimpleVec3, Vec3 } from "./vec3";
import { sinCosDeg } from "../utils/math";

type Matrix4Column = readonly [number, number, number, number];
export type Matrix4Raw = readonly [Matrix4Column, Matrix4Column, Matrix4Column, Matrix4Column];

/**This stores a 4*4 matrix in column major order*/
export class Matrix4 {
	public constructor(public readonly values: Matrix4Raw) { }

	public static readonly identity = new Matrix4([
		[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1],
	]);

	public static multiply(m1: Matrix4, m2: Matrix4): Matrix4 {
		const a = m1.values;
		const b = m2.values;

		const result: [
			[number, number, number, number],
			[number, number, number, number],
			[number, number, number, number],
			[number, number, number, number],
		] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] as const;

		for (let c = 0; c < 4; c++) {
			for (let r = 0; r < 4; r++) {
				result[c][r] =
					a[0][r] * b[c][0] +
					a[1][r] * b[c][1] +
					a[2][r] * b[c][2] +
					a[3][r] * b[c][3];
			}
		}

		return new Matrix4(result);
	}

	public multiply(other: Matrix4): Matrix4 {
		return Matrix4.multiply(this, other);
	}

	public static translate = (translation: AnyVec3): Matrix4 => {
		const [tx, ty, tz] = asSimpleVec3(translation);
		return new Matrix4([
			[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [tx, ty, tz, 1],
		]);
	};

	public translate = (translation: AnyVec3) => Matrix4.multiply(this, Matrix4.translate(translation));

	public static rotateX = (angle: number): Matrix4 => {
		const [sin, cos] = sinCosDeg(angle);

		return new Matrix4([
			[1, 0, 0, 0],
			[0, cos, sin, 0],
			[0, -sin, cos, 0],
			[0, 0, 0, 1],
		]);
	};

	public rotateX = (angle: number) => Matrix4.multiply(this, Matrix4.rotateX(angle));

	public static rotateY = (angle: number): Matrix4 => {
		const [sin, cos] = sinCosDeg(angle);

		return new Matrix4([
			[cos, 0, -sin, 0],
			[0, 1, 0, 0],
			[sin, 0, cos, 0],
			[0, 0, 0, 1],
		]);
	};

	public rotateY = (angle: number) => Matrix4.multiply(this, Matrix4.rotateY(angle));

	public static rotateZ = (angle: number): Matrix4 => {
		const [sin, cos] = sinCosDeg(angle);

		return new Matrix4([
			[cos, sin, 0, 0],
			[-sin, cos, 0, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 1],
		]);
	};

	public rotateZ = (angle: number) => Matrix4.multiply(this, Matrix4.rotateZ(angle));

	public static rotateAround = (angle: AnyVec3, center: AnyVec3): Matrix4 => {
		const [ax, ay, az] = asSimpleVec3(angle);
		const [cx, cy, cz] = asSimpleVec3(center);
		return Matrix4.translate([cx, cy, cz])
			.rotateX(ax).rotateY(ay).rotateZ(az)
			.translate([-cx, -cy, -cz]);
	};

	public rotateAround = (angle: AnyVec3, center: AnyVec3) => Matrix4.multiply(this, Matrix4.rotateAround(angle, center));

	public static scale = (factor: number | AnyVec3): Matrix4 => {
		const [sx, sy, sz] = typeof factor === "number" ? [factor, factor, factor] : asSimpleVec3(factor);
		return new Matrix4([
			[sx, 0, 0, 0],
			[0, sy, 0, 0],
			[0, 0, sz, 0],
			[0, 0, 0, 1],
		]);
	};

	public scale = (factor: number | AnyVec3): Matrix4 => Matrix4.multiply(this, Matrix4.scale(factor));

	public applyToVec3 = (vec: AnyVec3): Vec3 => {
		const [x, y, z] = asSimpleVec3(vec);
		const v = this.values;
		const nx = v[0][0] * x + v[1][0] * y + v[2][0] * z + v[3][0];
		const ny = v[0][1] * x + v[1][1] * y + v[2][1] * z + v[3][1];
		const nz = v[0][2] * x + v[1][2] * y + v[2][2] * z + v[3][2];
		return new Vec3(nx, ny, nz);
	};
}
