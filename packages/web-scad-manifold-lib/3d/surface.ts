import { Object3D } from "./object3d";
import { SimpleVec3 } from "./vec3";

const numberRange = (start: number, end: number): number[] => new Array(end - start).fill(0).map((_, i) => i + start);

export const createSurfaceMesh = (width: number, height: number, stepsWidth: number, stepsHeight: number, getHeight: (x: number, y: number) => number, bottomHeight = 0): Object3D => {
	if (stepsWidth < 2) throw new Error("stepsWidth must be at least 2");
	if (stepsHeight < 2) throw new Error("stepsHeight must be at least 2");

	const sizePerStepWidth = width / (stepsWidth - 1);
	const sizePerStepHeight = height / (stepsHeight - 1);

	const positions: SimpleVec3[] = [];
	const indices: [number, number, number][] = [];

	for (let y = 0; y < stepsHeight; y++) {
		for (let x = 0; x < stepsWidth; x++) {
			const height = getHeight(x, y);
			if (height < bottomHeight) throw new Error(`Height ${height} is smaller that bottomHeight ${bottomHeight}`);
			positions.push([x * sizePerStepWidth, y * sizePerStepHeight, height]);
		}
	}

	const pb1 = positions.length;
	positions.push([0, 0, bottomHeight]);
	positions.push([width, 0, bottomHeight]);
	positions.push([width, height, bottomHeight]);
	positions.push([0, height, bottomHeight]);

	//Bottom
	indices.push(
		[pb1 + 2, pb1 + 1, pb1],
		[pb1 + 3, pb1 + 2, pb1],
	);

	//Top
	for (let x = 0; x < stepsWidth - 1; x++) {
		for (let y = 0; y < stepsHeight - 1; y++) {
			const index = y * stepsWidth + x;
			indices.push(
				[index + stepsWidth, index, index + 1],
				[index + stepsWidth + 1, index + stepsWidth, index + 1],
			);
		}
	}

	const addMeshForSide = (p1: number, p2: number, top: readonly number[]) => {
		for (let i = 1; i < top.length; i++) {
			indices.push([p1, top[i], top[i - 1]]);
		}
		indices.push([p1, p2, top[top.length - 1]]);
	};

	addMeshForSide(pb1, pb1 + 1, numberRange(0, stepsWidth));
	addMeshForSide(pb1 + 2, pb1 + 3, numberRange(0, stepsWidth).map(v => stepsHeight * stepsWidth - v - 1));
	addMeshForSide(pb1 + 3, pb1, numberRange(0, stepsHeight).map(v => v * stepsWidth).reverse());
	addMeshForSide(pb1 + 1, pb1 + 2, numberRange(0, stepsHeight).map(v => (stepsHeight * stepsWidth) - (v * stepsWidth) - 1).reverse());

	return Object3D.fromMesh(
		new Float32Array(positions.flatMap(v => v)),
		new Uint32Array(indices.flatMap(v => v)),
	);
};