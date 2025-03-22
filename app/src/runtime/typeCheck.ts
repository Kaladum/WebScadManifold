import * as z from "zod";

export const WebScadModuleSchema = z.object({
    main: z.function(),
});

export const WebScadObjectSchema = z.object({
    type: z.literal("mesh"),
    vertices: z.instanceof(Float32Array),
    indices: z.instanceof(Uint32Array),
    //TODO Color
});

export const WebScadResultSchema = z.union([//Union means or
    WebScadObjectSchema,//TODO  
    z.null(),
    z.undefined(),
]);