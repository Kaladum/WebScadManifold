import { CrossSection } from "../internal/bindings";
import { Object2D } from "./object2d";

export const difference2d = (...others: readonly Object2D[]) => (current: Object2D) => {
	const cutAway = CrossSection.union(others.map(v => v.crossSection.internal));
	const result = current.apply(v => v.subtract(cutAway));
	cutAway.delete();
	return result;
};

export const union2d = (...others: readonly Object2D[]) => (current: Object2D) => {
	return Object2D.fromCrossSection(CrossSection.union([current.crossSection.internal, ...others.map(v => v.crossSection.internal)]));
};

export const intersect2d = (...others: readonly Object2D[]) => (current: Object2D) => {
	return Object2D.fromCrossSection(CrossSection.intersection([current.crossSection.internal, ...others.map(v => v.crossSection.internal)]));
};

export const decompose2d = (current: Object2D): Object2D[] => {
	return current.crossSection.internal.decompose().map(Object2D.fromCrossSection);
};