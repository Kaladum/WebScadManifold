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

export const sinDeg = (degrees: number): number => Math.sin(degrees * Math.PI / 180);
export const cosDeg = (degrees: number): number => Math.cos(degrees * Math.PI / 180);

export const radToDeg = (radians: number): number => radians * 180 / Math.PI;
export const degToRad = (degrees: number): number => degrees * Math.PI / 180;