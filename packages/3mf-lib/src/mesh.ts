import { Xml3mfMeshObject, Xml3mfTriangle, Xml3mfVertex } from "../xml-schema-3mf";
import { MaterialIdStorage } from "./3mfXmlFile";
import { Material3mf } from "./material";

export class Mesh3mf {
	public material?: Material3mf;

	public constructor(
		public vertices: Float32Array,
		public indices: Uint32Array,
		public name?: string,
	) {
		if (this.vertices.length % 3 !== 0) {
			throw new Error("Vertices array length must be a multiple of 3");
		}
		if (this.indices.length % 3 !== 0) {
			throw new Error("Indices array length must be a multiple of 3");
		}
	}

	public generate(id: number, materials: MaterialIdStorage): Xml3mfMeshObject {
		const vertexCount = this.vertices.length / 3;
		const xmlVertex: Xml3mfVertex[] = [];
		for (let i = 0; i < this.vertices.length; i += 3) {
			xmlVertex.push({
				"@_x": this.vertices[i].toString(),
				"@_y": this.vertices[i + 1].toString(),
				"@_z": this.vertices[i + 2].toString(),
			});
		}

		const xmlTriangles: Xml3mfTriangle[] = [];
		for (let i = 0; i < this.indices.length; i += 3) {
			const checkIndex = (index: number) => {
				if (index < 0 || index >= vertexCount) {
					throw new Error(`Index ${index} is out of bounds`);
				}
				return index;
			};
			xmlTriangles.push({
				"@_v1": checkIndex(this.indices[i]),
				"@_v2": checkIndex(this.indices[i + 1]),
				"@_v3": checkIndex(this.indices[i + 2]),
			});
		}

		let ids: { readonly pid: number, readonly pindex: number } | undefined = undefined;
		if (this.material) {
			ids = materials.get(this.material);
			if (ids === undefined) {
				throw new Error("Material not found in material ID storage");
			}
		}

		return {
			"@_id": id,
			"@_type": "model",
			"@_name": this.name,
			"@_pid": ids?.pid,
			"@_pindex": ids?.pindex,
			mesh: {
				vertices: { vertex: xmlVertex },
				triangles: { triangle: xmlTriangles },
			},
		};
	}
}
