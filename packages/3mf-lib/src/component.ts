import { Xml3mfComponent, Xml3mfComponentObject } from "../xml-schema-3mf";
import { Mat4, matrix2str } from "./matrix";

export class Component3mf {
	public constructor(
		public id: number,
		public name: string,
		public children: Child3mf[],
	) { }

	public generate(): Xml3mfComponentObject {
		return {
			"@_id": this.id,
			"@_type": "model",
			"@_name": this.name,
			components: {
				component: this.children.map(v => v.generate()),
			},
		};
	}
}

export class Child3mf {
	public constructor(
		public objectID: number,
		public transform?: Mat4,
	) { }

	public generate(): Xml3mfComponent {
		return {
			"@_objectid": this.objectID,
			"@_transform": this.transform !== undefined ? matrix2str(this.transform) : undefined,
		};
	}
}