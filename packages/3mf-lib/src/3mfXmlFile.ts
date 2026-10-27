import XMLBuilder from "fast-xml-builder";
import { Xml3mf, Xml3mfBase } from "../xml-schema-3mf";
import { Xml3mfHeader } from "./header";
import { Child3mf, Component3mf } from "./component";
import { Material3mf } from "./material";
import { Mesh3mf } from "./mesh";

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
}