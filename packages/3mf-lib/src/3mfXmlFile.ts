import XMLBuilder from "fast-xml-builder";
import { Xml3mf, Xml3mfBase, Xml3mfMesh, Xml3mfSchema } from "../xml-schema-3mf";
import { Xml3mfHeader } from "./header";
import { Child3mf, Component3mf } from "./component";
import { Material3mf } from "./material";
import { Mesh3mf } from "./mesh";
import { XMLParser } from "fast-xml-parser";
import { str2matrix } from "./matrix";

export type IdStorage = Map<Mesh3mf | Component3mf, number>;
export type MaterialIdStorage = Map<Material3mf, { readonly pid: number, readonly pindex: number }>;

export class Xml3MfFile {
	public readonly header = new Xml3mfHeader();

	public readonly items: Child3mf[] = [];

	public language = "en-US";

	public generate(): string {
		const data: Xml3mf = {
			"?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
			model: {
				"@_unit": this.header.unit,
				"@_xml:lang": this.language,
				"@_xmlns": "http://schemas.microsoft.com/3dmanufacturing/core/2015/02",
				"@_xmlns:slic3rpe": "http://schemas.slic3r.org/3mf/2017/06",
				metadata: this.header.generateMetadata(),
				resources: {
					basematerials: [],
					object: [],
				},
				build: { item: [] },
			},
		};

		let nextId = 1;
		const idStorage: IdStorage = new Map();
		const materialIdStorage: MaterialIdStorage = new Map();

		const allMeshes = new Set<Mesh3mf>();
		const allComponents = new Set<Component3mf>();

		const handleItem = (item: Child3mf) => {
			if (item.object instanceof Mesh3mf) {
				allMeshes.add(item.object);
			} else if (item.object instanceof Component3mf) {
				allComponents.add(item.object);
				for (const child of item.object.children) {
					handleItem(child);
				}
			}
		};

		for (const item of this.items) {
			handleItem(item);
		}

		const allMaterials = new Set(allMeshes.values().map(mesh => mesh.material).filter(v => v !== undefined));

		if (allMaterials.size > 0) {
			const baseMaterialId = nextId++;
			const base: Xml3mfBase[] = [];
			for (const material of allMaterials) {
				materialIdStorage.set(material, { pid: baseMaterialId, pindex: base.length });
				base.push(material.generate());
			}
			data.model.resources.basematerials = [{
				"@_id": baseMaterialId,
				base,
			}];
		}

		for (const mesh of allMeshes) {
			const id = nextId++;
			idStorage.set(mesh, id);
			data.model.resources.object!.push(mesh.generate(id, materialIdStorage));
		}

		for (const component of allComponents) {
			const id = nextId++;
			idStorage.set(component, id);
			data.model.resources.object!.push(component.generate(id, idStorage));
		}

		for (const item of this.items) {
			data.model.build.item.push(item.generate(idStorage));
		}

		const builder = new XMLBuilder({
			ignoreAttributes: false,
			format: true,
			suppressEmptyNode: true,
		});

		const result: string = builder.build(data);
		return result;
	}

	public loadXml(data: string) {
		const parser = new XMLParser({ ignoreAttributes: false });
		const rawData = parser.parse(data);
		const xml = Xml3mfSchema.parse(rawData);

		this.header.unit = xml.model["@_unit"];
		// TODO: Load metadata

		//TODO handle basematerials

		const elementsById = new Map<number, Mesh3mf | Component3mf>();

		for (const obj of xml.model.resources.object ?? []) {
			if ("mesh" in obj) {
				const mesh = loadMesh(obj.mesh);
				elementsById.set(obj["@_id"], new Mesh3mf(mesh.vertices, mesh.indices));
			}
			if ("components" in obj) {
				const id = obj["@_id"];
				const children: Child3mf[] = [];
				for (const comp of obj.components.component) {
					const object = elementsById.get(comp["@_objectid"]);
					if (object === undefined) {
						throw new Error(`Object with ID ${comp["@_objectid"]} not found`);
					}
					const newChild = new Child3mf(object);
					newChild.transform = comp["@_transform"] ? str2matrix(comp["@_transform"]) : undefined;
					children.push(newChild);
				}
				elementsById.set(id, new Component3mf(undefined, children));
			}
		}
		for (const build of xml.model.build.item) {
			const object = elementsById.get(build["@_objectid"]);
			if (object === undefined) {
				throw new Error(`Object with ID ${build["@_objectid"]} not found`);
			}
			const newChild = new Child3mf(object);
			newChild.transform = build["@_transform"] ? str2matrix(build["@_transform"]) : undefined;
			this.items.push(newChild);
		}
	}
}

interface MeshData {
	vertices: Float32Array,
	indices: Uint32Array,
};

function loadMesh(mesh: Xml3mfMesh): MeshData {
	const vertices: number[] = [];
	const indices: number[] = [];

	for (const vertex of mesh.vertices?.vertex ?? []) {
		vertices.push(parseFloat(vertex["@_x"]));
		vertices.push(parseFloat(vertex["@_y"]));
		vertices.push(parseFloat(vertex["@_z"]));
	}

	if (vertices.length % 3 !== 0) {
		throw new Error("Invalid vertex count. Must be a multiple of 3.");
	}

	const vertexCount = vertices.length / 3;

	const checkIndex = (index: number) => {
		if (index < 0 || index >= vertexCount) {
			throw new Error(`Invalid triangle index: ${index}`);
		}
		return index;
	};

	for (const triangle of mesh.triangles.triangle ?? []) {
		indices.push(checkIndex(triangle["@_v1"]));
		indices.push(checkIndex(triangle["@_v2"]));
		indices.push(checkIndex(triangle["@_v3"]));
	}

	if (indices.length % 3 !== 0) {
		throw new Error("Invalid index count. Must be a multiple of 3.");
	}

	return {
		vertices: new Float32Array(vertices),
		indices: new Uint32Array(indices),
	};
}