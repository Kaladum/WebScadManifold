import { MultiValue } from "web-scad-manifold-lib";
import * as z from "zod";

export function createMultiSchema<T>(itemSchema: z.ZodType<T, z.ZodTypeDef, unknown>): z.ZodType<MultiValue<T>, z.ZodTypeDef, unknown> {
	const result: z.ZodType<MultiValue<T>, z.ZodTypeDef, unknown> = z.union([
		itemSchema,
		z.lazy(() => arraySchema),
		z.lazy(() => objectSchema),
	]);

	const arraySchema = result.array();
	const objectSchema = z.record(z.string().nonempty(), result);

	return result;
}