import { Xml3mfBase } from "../xml-schema-3mf";

const IS_VALID_HEX_COLOR = /^#([0-9A-F]{6}|[0-9A-F]{8})$/;

export class Material3mf {
	public constructor(
		public name: string,
		public displayColor: string,
	) {
		if (!IS_VALID_HEX_COLOR.test(displayColor)) {
			throw new Error(`Invalid display color: ${displayColor}. Expected format: #RRGGBB or #RRGGBBAA`);
		}
	}

	public generate(): Xml3mfBase {
		return {
			"@_name": this.name,
			"@_displaycolor": this.displayColor,
		};
	}

	public static colorToHex(color: readonly [number, number, number] | readonly [number, number, number, number]): string {
		const convert = (v: number) => {
			const scaledValue = Math.max(0, Math.min(255, Math.floor(v * 255)));
			return scaledValue.toString(16).toUpperCase().padStart(2, "0");
		};
		const values = [
			convert(color[0]),
			convert(color[1]),
			convert(color[2]),
		];
		if (color.length === 4) {
			values.push(convert(color[3]));
		}
		return "#" + values.join("");
	}
}