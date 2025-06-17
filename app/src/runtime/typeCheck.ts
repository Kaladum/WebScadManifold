import { WebScadExportable, WebScadObject } from "web-scad-manifold-lib";
import * as z from "zod/v4";
import { createMultiSchema } from "./type/multi";
import { WebScadMultiParameterSchema } from "./type/parameter";

export const WebScadModuleSchema = z.object({
	main: z.custom<() => unknown>(v => typeof v === "function", { error: "value must be a function" }),
	parameters: WebScadMultiParameterSchema.optional(),
});

export const WebScadColorValue = z.number().min(0).max(1);
export const WebScadColor = z.union([
	z.tuple([WebScadColorValue, WebScadColorValue, WebScadColorValue]),
	z.tuple([WebScadColorValue, WebScadColorValue, WebScadColorValue, WebScadColorValue]),
]);

export const WebScadMeshSchema = z.object({
	type: z.literal("mesh"),
	vertices: z.instanceof(Float32Array),
	indices: z.instanceof(Uint32Array),
	color: WebScadColor.optional(),
});

export const WebScadObjectSchema = z.object({
	type: z.literal("object"),
	meshes: WebScadMeshSchema.array(),
});

export const WebScadObjectSchemaTransformExport = z.object({ isAWebScadExportableValue: z.literal(true) }).transform<WebScadObject>(v => (v as WebScadExportable<WebScadObject>).export());
export const WebScadObjectSchemaPreprocessExport = z.preprocess(v => {
	if (typeof v !== "object") return v;
	const exportable = v as WebScadExportable<WebScadObject>;
	if (exportable.isAWebScadExportableValue !== true) return v;
	return exportable.export();
}, WebScadObjectSchema);

export const WebScadObjectOrExportableObjectSchema = z.union([
	WebScadObjectSchema,
	WebScadObjectSchemaPreprocessExport,
]);

export const WebScadObjectMultiSchema = createMultiSchema(WebScadObjectOrExportableObjectSchema);

export const WebScadResultSchema = z.union([
	WebScadObjectMultiSchema,
	z.null(),
	z.undefined(),
]);