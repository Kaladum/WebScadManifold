import opentype, { PathCommand } from "opentype.js";
import { SimpleVec2 } from "./vec2";
import { Object2D } from "./object2d";
import { pipe } from "../pipe";
import { translate2d } from "./transform2d";

export class Font {
	private readonly font: opentype.Font;

	public constructor(fontData: ArrayBuffer) {
		this.font = opentype.parse(fontData);
	}

	public text2d = (text: string, fontSize: number, options: Text2dOptions = {}): Object2D => {
		const renderOptions: opentype.RenderOptions = {
			kerning: options.kerning,
		};
		const path = this.font.getPath(text, 0, 0, fontSize, renderOptions);

		const polygon = commandsToPolygon(path.commands, options.curveSplits ?? 1);

		return pipe(
			Object2D.fromPolygons(polygon),
			options.horizontalCenter ? (v => {
				const width = this.font.getAdvanceWidth(text, fontSize, renderOptions);
				return translate2d([-width / 2, 0])(v);
			}) : v => v,
		);
	};
}

const commandsToPolygon = (commands: readonly PathCommand[], curveSplits: number) => {
	const result: SimpleVec2[][] = [];

	let startPosition: SimpleVec2 | undefined;
	let lastKnownPosition: SimpleVec2 | undefined;
	let currentPath: SimpleVec2[] = [];
	for (const command of commands) {
		switch (command.type) {
			case "M":
				{
					const pos: [number, number] = [command.x, command.y];
					lastKnownPosition = pos;
					startPosition = pos;
					currentPath.push(pos);
				}
				break;
			case "L":
				{
					const pos: [number, number] = [command.x, command.y];
					lastKnownPosition = pos;
					currentPath.push(pos);
				}
				break;
			case "Z":
				lastKnownPosition = startPosition;
				if (startPosition === undefined) throw new Error("Can't convert text to path. The start position is not known.");
				currentPath.push(startPosition!);
				result.push(currentPath);
				currentPath = [];
				break;
			case "Q":
				{
					const pos: [number, number] = [command.x, command.y];
					if (lastKnownPosition === undefined) throw new Error("Can't convert text to path. The last position is not known.");
					currentPath.push(...cubicBezierCurveToPoints(lastKnownPosition, [command.x1, command.y1], pos, curveSplits));
					lastKnownPosition = pos;
				}
				break;
			default:
				throw new Error(`Unknown path command ${command.type}`);
		}
	}
	return result;
};

const cubicBezierCurveToPoints = (start: SimpleVec2, control: SimpleVec2, end: SimpleVec2, splits: number) => {
	const intermediatePoints: SimpleVec2[] = [];
	const divider = splits + 1;
	for (let i = 0; i < splits; i++) {
		const t = (i + 1) / divider;
		intermediatePoints.push(cubicBezierCurve(start, control, end, t));
	}
	return [
		start,
		...intermediatePoints,
		end,
	];
};

const cubicBezierCurve = (start: SimpleVec2, control: SimpleVec2, end: SimpleVec2, t: number): SimpleVec2 => {
	const tSquared = t ** 2;

	return [
		(start[0] - 2 * control[0] + end[0]) * tSquared + (-2 * start[0] + 2 * control[0]) * t + start[0],
		(start[1] - 2 * control[1] + end[1]) * tSquared + (-2 * start[1] + 2 * control[1]) * t + start[1],
	];
};

export interface Text2dOptions {
	readonly curveSplits?: number,
	readonly kerning?: boolean,
	readonly horizontalCenter?: boolean,
}