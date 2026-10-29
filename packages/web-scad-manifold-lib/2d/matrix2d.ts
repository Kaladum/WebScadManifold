import { AnyVec2, asSimpleVec2, Vec2 } from "./vec2";
import { sinCosDeg } from "../utils/math";

type Matrix3Column = readonly [number, number, number];
export type Matrix3Raw = readonly [Matrix3Column, Matrix3Column, Matrix3Column];

/**This stores a 3*3 matrix in column major order*/
export class Matrix3 {
	public constructor(public readonly values: Matrix3Raw) { }

	public static readonly identity = new Matrix3([
		[1, 0, 0], [0, 1, 0], [0, 0, 1],
	]);

	public static multiply(m1: Matrix3, m2: Matrix3): Matrix3 {
		const a = m1.values;
		const b = m2.values;

		const result: [[number, number, number], [number, number, number], [number, number, number]] = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		];

		for (let c = 0; c < 3; c++) {
			for (let r = 0; r < 3; r++) {
				result[c][r] =
					a[0][r] * b[c][0] +
					a[1][r] * b[c][1] +
					a[2][r] * b[c][2];
			}
		}

		return new Matrix3(result);
	}

	public multiply(other: Matrix3): Matrix3 {
		return Matrix3.multiply(this, other);
	}

	public static translate = (translation: AnyVec2): Matrix3 => {
		const [tx, ty] = asSimpleVec2(translation);
		return new Matrix3([
			[1, 0, 0], [0, 1, 0], [tx, ty, 1],
		]);
	};

	public translate = (translation: AnyVec2) => Matrix3.multiply(this, Matrix3.translate(translation));

	public static rotate = (angle: number): Matrix3 => {
		const [sin, cos] = sinCosDeg(angle);

		return new Matrix3([
			[cos, sin, 0],
			[-sin, cos, 0],
			[0, 0, 1],
		]);
	};
	public rotate = (angle: number) => Matrix3.multiply(this, Matrix3.rotate(angle));

	public static rotateAround = (angle: number, center: AnyVec2): Matrix3 => {
		const [cx, cy] = asSimpleVec2(center);
		return Matrix3.translate([cx, cy]).rotate(angle).translate([-cx, -cy]);
	};

	public rotateAround = (angle: number, center: AnyVec2) => Matrix3.multiply(this, Matrix3.rotateAround(angle, center));

	public static scale = (factor: number | AnyVec2): Matrix3 => {
		const [sx, sy] = typeof factor === "number" ? [factor, factor] : asSimpleVec2(factor);
		return new Matrix3([
			[sx, 0, 0],
			[0, sy, 0],
			[0, 0, 1],
		]);
	};

	public scale = (factor: number | AnyVec2): Matrix3 => Matrix3.multiply(this, Matrix3.scale(factor));

	public applyToVec2 = (vec: AnyVec2): Vec2 => {
		const [x, y] = asSimpleVec2(vec);
		const v = this.values;
		const nx = v[0][0] * x + v[1][0] * y + v[2][0];
		const ny = v[0][1] * x + v[1][1] * y + v[2][1];
		return new Vec2(nx, ny);
	};
}