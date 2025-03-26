import { XMLBuilder } from "fast-xml-parser"
import { Xml3mf, Xml3mfBuild, Xml3mfMeshObject, Xml3mfModel, Xml3mfResource, Xml3mfTriangle, Xml3mfVertex } from "../xml-schema-3mf"
import { Xml3mfHeader } from "./header";
import { Child3mf, Component3mf } from "./component";

export class Xml3MfFile {
	public precision: number = 17;
	public readonly header = new Xml3mfHeader();

	public readonly meshes: Mesh3mf[] = [];
	public readonly components: Component3mf[] = [];
	public readonly items: Child3mf[] = [];

	public generate(): string {
		const data: Xml3mf = {
			'?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
			model: this.generateModel(
				[
					//Mesh objects
					...this.meshes.map(v => ({ object: v.generate(this.precision) })),
					//Component objects
					...this.components.map(v => ({ object: v.generate() })),
				],
				{ item: this.items.map(v => v.generate()) },
			)
		}

		const builder = new XMLBuilder({
			ignoreAttributes: false,
			format: true,
			suppressEmptyNode: true
		});

		return builder.build(data);
	}

	private generateModel(resources: Xml3mfResource[], build: Xml3mfBuild): Xml3mfModel {
		return {
			'@_unit': this.header.unit ?? 'millimeter',
			'@_xml:lang': 'en-US',
			'@_xmlns': 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02',
			'@_xmlns:slic3rpe': 'http://schemas.slic3r.org/3mf/2017/06',
			metadata: this.header.generateMetadata(),
			resources,
			build,
		};
	}
}

export class Mesh3mf {
	public constructor(
		public id: number,
		public vertices: Float32Array,
		public indices: Uint32Array,
		public name?: string
	) { }

	public generate(precision: number): Xml3mfMeshObject {
		const xmlVertex: Xml3mfVertex[] = [];
		for (let i = 0; i < this.vertices.length; i += 3) {
			xmlVertex.push({
				"@_x": this.vertices[i].toFixed(precision),
				"@_y": this.vertices[i + 1].toFixed(precision),
				"@_z": this.vertices[i + 2].toFixed(precision),
			});
		}

		const xmlTriangles: Xml3mfTriangle[] = [];
		for (let i = 0; i < this.indices.length; i += 3) {
			xmlTriangles.push({
				"@_v1": this.indices[i],
				"@_v2": this.indices[i + 1],
				"@_v3": this.indices[i + 2],
			});
		}

		return {
			"@_id": this.id,
			"@_type": "model",
			"@_name": this.name,
			mesh: {
				vertices: { vertex: xmlVertex },
				triangles: { triangle: xmlTriangles },
			},
		};
	}
}