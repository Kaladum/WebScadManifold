import { circle } from "../2d";
import { Manifold } from "../internal/bindings";
import { Object3D } from "./object3d";
import { AnyVec3, asSimpleVec3 } from "./vec3";

export const cube = (size?: AnyVec3, center?: boolean) => Object3D.fromManifold(Manifold.cube(asSimpleVec3(size ?? [1, 1, 1]), center));
export const sphere = (radius: number, circularSegments?: number) => Object3D.fromManifold(Manifold.sphere(radius ?? 1, circularSegments));
export const tetrahedron = () => Object3D.fromManifold(Manifold.tetrahedron());

export const cylinder = (radius = 1, height = 1) => circle(radius).extrude(height);
