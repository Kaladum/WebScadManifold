export type Mat4 = readonly [
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
	number, number, number, number,
];

/** transform for attribute as specified in 3mf format
 * 
 * When objects need to be transformed for rotation, scaling, or translation purposes, 
 * row-major affine 3D matrices (4x4) are used. The matrix SHOULD NOT be singular or nearly singular.
 * Transforms are of the form, where only the first 3 column values are specified. 
 * The last column is never provided, and has the fixed values 0.0, 0.0, 0.0, 1.0. 
 * When specified as an attribute value, 
 * matrices have the form "m00 m01 m02 m10 m11 m12 m20 m21 m22 m30 m31 m32" 
 * where each value is a decimal number of arbitrary precision.
 * @return string transform attribute value
*/
export const matrix2str = (m: Mat4) => `${m[0]} ${m[1]} ${m[2]} ${m[4]} ${m[5]} ${m[6]} ${m[8]} ${m[9]} ${m[10]} ${m[12]} ${m[13]} ${m[14]}`;