import * as z from "zod";

const Xml3mfUnitSchema = z.enum(["micron", "millimeter", "centimeter", "inch", "foot", "meter"]);
export type Xml3mfUnit = z.infer<typeof Xml3mfUnitSchema>;

const Xml3mfObjectTypeSchema = z.enum(["model", "solidsupport", "support", "surface", "other"]);
export type Xml3mfObjectType = z.infer<typeof Xml3mfObjectTypeSchema>;

const Xml3mfMetadataSchema = z.object({
	"@_name": z.string(),
	"@_preserve": z.boolean().optional(),
	"@_type": z.string().optional(),
	"#text": z.string(),
});
export type Xml3mfMetadata = z.infer<typeof Xml3mfMetadataSchema>;

const Xml3mfMetadataGroupSchema = z.object({
	metadata: z.array(Xml3mfMetadataSchema),
});
export type Xml3mfMetadataGroup = z.infer<typeof Xml3mfMetadataGroupSchema>;

const Xml3mfObjectBaseSchema = z.object({
	"@_id": z.number(),
	"@_type": Xml3mfObjectTypeSchema.optional(),
	"@_thumbnail": z.string().optional(),
	"@_partnumber": z.string().optional(),
	"@_name": z.string().optional(),
	"@_pid": z.number().optional(),
	"@_pindex": z.number().optional(),
	metadatagroup: Xml3mfMetadataGroupSchema.optional(),
});

const Xml3mfVertexSchema = z.object({
	"@_x": z.string(),
	"@_y": z.string(),
	"@_z": z.string(),
});
export type Xml3mfVertex = z.infer<typeof Xml3mfVertexSchema>;

const Xml3mfTriangleSchema = z.object({
	"@_v1": z.number(),
	"@_v2": z.number(),
	"@_v3": z.number(),
	"@_pid": z.number().optional(),
	"@_p1": z.number().optional(),
	"@_p2": z.number().optional(),
	"@_p3": z.number().optional(),
});
export type Xml3mfTriangle = z.infer<typeof Xml3mfTriangleSchema>;

export const Xml3mfMeshSchema = z.object({
	vertices: z.object({
		vertex: z.array(Xml3mfVertexSchema),
	}),
	triangles: z.object({
		triangle: z.array(Xml3mfTriangleSchema),
	}),
});
export type Xml3mfMesh = z.infer<typeof Xml3mfMeshSchema>;

const Xml3mfMeshObjectSchema = Xml3mfObjectBaseSchema.extend({
	mesh: Xml3mfMeshSchema,
});
export type Xml3mfMeshObject = z.infer<typeof Xml3mfMeshObjectSchema>;

const Xml3mfComponentSchema = z.object({
	"@_objectid": z.number(),
	"@_transform": z.string().optional(),
});
export type Xml3mfComponent = z.infer<typeof Xml3mfComponentSchema>;

const Xml3mfComponentObjectSchema = Xml3mfObjectBaseSchema.extend({
	components: z.object({
		component: z.array(Xml3mfComponentSchema),
	}),
});
export type Xml3mfComponentObject = z.infer<typeof Xml3mfComponentObjectSchema>;

const Xml3mfItemSchema = z.object({
	"@_objectid": z.number(),
	"@_transform": z.string().optional(),
	"@_partnumber": z.string().optional(),
	metadatagroup: Xml3mfMetadataGroupSchema.optional(),
});
export type Xml3mfItem = z.infer<typeof Xml3mfItemSchema>;

export const Xml3mfBuildSchema = z.object({
	item: z.array(Xml3mfItemSchema),
});
export type Xml3mfBuild = z.infer<typeof Xml3mfBuildSchema>;

const Xml3mfBaseSchema = z.object({
	"@_name": z.string(),
	"@_displaycolor": z.string(),//TODO improve
});

export type Xml3mfBase = z.infer<typeof Xml3mfBaseSchema>;

const Xml3mfBaseMaterialSchema = z.object({
	"@_id": z.number(),
	base: z.array(Xml3mfBaseSchema),
});

export type Xml3mfBaseMaterial = z.infer<typeof Xml3mfBaseMaterialSchema>;

const Xml3mfResourcesSchema = z.object({
	basematerials: z.array(Xml3mfBaseMaterialSchema).optional(),
	object: z.array(z.union([Xml3mfMeshObjectSchema, Xml3mfComponentObjectSchema])).optional(),
});
export type Xml3mfResources = z.infer<typeof Xml3mfResourcesSchema>;

const Xml3mfModelSchema = z.object({
	"@_unit": Xml3mfUnitSchema,
	"@_xml:lang": z.string(),
	"@_xmlns": z.literal("http://schemas.microsoft.com/3dmanufacturing/core/2015/02"),
	"@_xmlns:slic3rpe": z.literal("http://schemas.slic3r.org/3mf/2017/06"),
	"@_requiredextensions": z.string().optional(),
	"@_recommendedextensions": z.string().optional(),
	metadata: z.array(Xml3mfMetadataSchema),
	resources: Xml3mfResourcesSchema,
	build: Xml3mfBuildSchema,
});
export type Xml3mfModel = z.infer<typeof Xml3mfModelSchema>;

export const Xml3mfSchema = z.object({
	"?xml": z.object({
		"@_version": z.literal("1.0"),
		"@_encoding": z.literal("UTF-8"),
	}),
	model: Xml3mfModelSchema,
});
export type Xml3mf = z.infer<typeof Xml3mfSchema>;


export const Xml3mfRelationFileSchema = z.object({
	"?xml": z.object({
		"@_version": z.literal("1.0"),
		"@_encoding": z.literal("UTF-8"),
	}),
	Relationships: z.object({
		"@_xmlns": z.literal("http://schemas.openxmlformats.org/package/2006/relationships"),
		Relationship: z.array(z.object({
			"@_Target": z.string(),
			"@_Id": z.string(),
			"@_Type": z.string(),
		})),
	}),
});
export type Xml3mfRelationFile = z.infer<typeof Xml3mfRelationFileSchema>;