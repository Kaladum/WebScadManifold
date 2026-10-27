import { Xml3mfComponent, Xml3mfComponentObject } from "../xml-schema-3mf";
import { Mat4, matrix2str } from "./matrix";
import { Mesh3mf } from "./mesh";
import type { IdStorage } from "./3mfXmlFile";

export class Component3mf {
	public constructor(
		public name: string,
		public children: Child3mf[],
	) { }

	public generate(id: number, idStorage: IdStorage): Xml3mfComponentObject {
		return {
			"@_id": id,
			"@_type": "model",
			"@_name": this.name,
			components: {
				component: this.children.map(v => v.generate(idStorage)),
			},
		};
	}
}

export class Child3mf {
	public constructor(
		public object: Component3mf | Mesh3mf,
		public transform?: Mat4,
	) { }

	public generate(idStorage: IdStorage): Xml3mfComponent {
		const objectID = idStorage.get(this.object);
		if (objectID === undefined) {
			throw new Error("Object ID not found in IdStorage");
		}
		return {
			"@_objectid": objectID,
			"@_transform": this.transform !== undefined ? matrix2str(this.transform) : undefined,
		};
	}
}