export type Axis = "X" | "Y" | "Z";

export const range = (start: number, end: number, step = 1): number[] => {
	const result = [];
	for (let i = start; i < end; i += step) {
		result.push(i);
	}
	return result;
};

export const rangeInclude = (start: number, end: number, step = 1): number[] => {
	const result = [];
	for (let i = start; i <= end; i += step) {
		result.push(i);
	}
	return result;
};

export const distribute1d = (start: number, end: number, count: number, spaceFromEdges = false): number[] => {
	if (count < 1) return [];
	if (count === 1) {
		return [start + (end - start) / 2];
	}
	const sections = spaceFromEdges ? count : count - 1;
	const range = end - start;
	const step = range / sections;
	let offset = start;
	if (spaceFromEdges) {
		offset += step / 2;
	}
	const result = [];
	for (let i = 0; i <= sections; i++) {
		result.push(offset + i * step);
	}
	return result;
};

export const sinDeg = (degrees: number): number => Math.sin(degrees * Math.PI / 180);
export const cosDeg = (degrees: number): number => Math.cos(degrees * Math.PI / 180);

export const radToDeg = (radians: number): number => radians * 180 / Math.PI;
export const degToRad = (degrees: number): number => degrees * Math.PI / 180;