import { XMLBuilder } from "fast-xml-parser";
import { Xml3mfRelationFile } from "../xml-schema-3mf";
import { Xml3MfFile } from "./3mfXmlFile";

import { zipSync, Zippable } from "fflate";

const MODEL_PATH = "3D/3dmodel.model";
const THUMBNAIL_PATH = 'Metadata/thumbnail.png';

export class File3mf extends Xml3MfFile {
	public thumbnail?: Uint8Array;

	public export() {
		const content: Zippable = {};
		const utf8Encoder = new TextEncoder()

		content[fileForContentTypes.name] = [utf8Encoder.encode(fileForContentTypes.content), { level: 9 }];

		const relationships: Xml3mfRelationFile = {
			'?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
			Relationships: {
				'@_xmlns': 'http://schemas.openxmlformats.org/package/2006/relationships',
				Relationship: [
					{ '@_Target': MODEL_PATH, "@_Id": `rel-1`, '@_Type': 'http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel' },
				]
			},
		};

		const relationshipsXmlBuilder = new XMLBuilder({ ignoreAttributes: false, format: true, suppressEmptyNode: true });

		if (this.thumbnail !== undefined) {
			content[THUMBNAIL_PATH] = [this.thumbnail, { level: 0 }];
			relationships.Relationships.Relationship.push(
				{ '@_Target': THUMBNAIL_PATH, "@_Id": `rel-2`, '@_Type': 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail' },
			)
		}

		content[MODEL_PATH] = [utf8Encoder.encode(this.generate()), { level: 9 }];
		content["_rels/.rels"] = [utf8Encoder.encode(relationshipsXmlBuilder.build(relationships)), { level: 9 }];

		return zipSync(content);
	}
}

/** File that describes content types inside a 3mf  */
const fileForContentTypes = {
	name: '[Content_Types].xml',
	content: `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="png" ContentType="image/png" />
</Types>`,
};