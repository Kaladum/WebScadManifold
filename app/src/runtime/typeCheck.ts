import { MultiResult, WebScadExportable, WebScadObject } from "web-scad-manifold-lib";
import * as z from "zod";

export const WebScadModuleSchema = z.object({
	main: z.function(),
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

export const WebScadObjectMultiSchema: z.ZodType<MultiResult<WebScadObject>, z.ZodTypeDef, unknown> = z.union([
	WebScadObjectOrExportableObjectSchema,
	z.lazy(() => WebScadMultiObjectArraySchema),
]);

export const WebScadMultiObjectArraySchema = WebScadObjectMultiSchema.array();
export const WebScadMultiObjectObject = z.record(z.string().nonempty(), WebScadObjectMultiSchema);

export const WebScadResultSchema = z.union([
	WebScadObjectMultiSchema,
	z.null(),
	z.undefined(),
]);