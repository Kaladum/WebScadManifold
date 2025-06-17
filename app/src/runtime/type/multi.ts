import { MultiValue } from "web-scad-manifold-lib";
import * as z from "zod/v4";

export function createMultiSchema<T>(itemSchema: z.ZodType<T>): z.ZodType<MultiValue<T>> {
	const result: z.ZodType<MultiValue<T>> = z.union([
		itemSchema,
		z.lazy(() => arraySchema),
		z.lazy(() => objectSchema),
	]);

	const arraySchema = result.array();
	const objectSchema = z.record(z.string().nonempty(), result);

	return result;
}