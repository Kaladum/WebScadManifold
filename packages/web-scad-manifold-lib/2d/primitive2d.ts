import { CrossSection } from "../internal/bindings";
import { Object2D } from "./object2d";
import { AnyVec2, asSimpleVec2 } from "./vec2";

export const square = (size?: AnyVec2, center?: boolean) => Object2D.fromCrossSection(CrossSection.square(asSimpleVec2(size ?? [1, 1]), center));
export const circle = (radius: number, circularSegments?: number) => Object2D.fromCrossSection(CrossSection.circle(radius, circularSegments));
