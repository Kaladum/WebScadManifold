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
    meshes: WebScadMeshSchema.array()
});

export const WebScadResultSchema = z.union([//Union means or
    WebScadObjectSchema,//TODO  
    z.null(),
    z.undefined(),
]);