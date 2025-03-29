import { Manifold } from "../internal/bindings";
import { Object3D } from "./object3d";
import { AnyVec3, asSimpleVec3 } from "./vec3";

export const cube = (size?: AnyVec3, center?: boolean) => Object3D.fromManifold(Manifold.cube(size !== undefined ? asSimpleVec3(size) : undefined, center));
export const sphere = (radius: number, circularSegments?: number) => Object3D.fromManifold(Manifold.sphere(radius, circularSegments));
export const tetrahedron = () => Object3D.fromManifold(Manifold.tetrahedron());
