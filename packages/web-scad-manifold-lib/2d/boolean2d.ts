import { CrossSection } from "../internal/bindings";
import { Object2D } from "./object2d";

export const difference2d = (current: Object2D, ...others: readonly Object2D[]) => {
	const cutAway = CrossSection.union(others.map(v => v.crossSection.internal));
	const result = current.applyRaw(v => v.subtract(cutAway));
	cutAway.delete();
	return result;
};

export const union2d = (...items: readonly Object2D[]) => {
	return Object2D.fromCrossSection(CrossSection.union(items.map(v => v.crossSection.internal)));
};

export const intersect2d = (...items: readonly Object2D[]) => {
	return Object2D.fromCrossSection(CrossSection.intersection(items.map(v => v.crossSection.internal)));
};

export const decompose2d = (current: Object2D): Object2D[] => {
	return current.crossSection.internal.decompose().map(Object2D.fromCrossSection);
};