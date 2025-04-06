import { Xml3mfMetadata, Xml3mfUnit } from "../xml-schema-3mf";

export class Xml3mfHeader {
	public unit: Xml3mfUnit = "millimeter";
	public title?: string;
	public author?: string;
	public description?: string;
	public application?: string;
	public creationDate?: Date = new Date();
	public license?: string;
	public copyright?: string;
	public modificationDate?: Date = new Date();
	public rating?: string;

	public generateMetadata(): Xml3mfMetadata[] {
		const result: Xml3mfMetadata[] = [
			{ "@_name": "slic3rpe:Version3mf", "#text": "1" },
		];

		if (this.title !== undefined) result.push({ "@_name": "Title", "#text": this.title });
		if (this.author !== undefined) result.push({ "@_name": "Designer", "#text": this.author });
		if (this.description !== undefined) result.push({ "@_name": "Description", "#text": this.description });
		if (this.copyright !== undefined) result.push({ "@_name": "Copyright", "#text": this.copyright });
		if (this.license !== undefined) result.push({ "@_name": "LicenseTerms", "#text": this.license });
		if (this.rating !== undefined) result.push({ "@_name": "Rating", "#text": this.rating });
		if (this.application !== undefined) result.push({ "@_name": "Application", "#text": this.application });
		result.push({ "@_name": "CreationDate", "#text": toDate3mf(this.creationDate ?? new Date()) });
		result.push({ "@_name": "ModificationDate", "#text": toDate3mf(this.modificationDate ?? new Date()) });

		return result;
	}
}

export const toDate3mf = (d: Date): string => (d ? d.toISOString().substring(0, 10) : "");