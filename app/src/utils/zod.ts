import * as z from "zod/v4";

export function parseZodSchemaOrStringError<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
	const parsed = schema.safeParse(value);
	if (parsed.success) {
		return parsed.data;
	} else {
		throw new Error(z.prettifyError(parsed.error));
	}
}