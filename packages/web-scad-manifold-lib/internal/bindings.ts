import Module from "manifold-3d";

//@ts-expect-error This is a virtual URL
import manifoldWasmUrl from "manifold-3d/manifold.wasm?url";

import type * as EncapsulatedTypes from "manifold-3d/manifold-encapsulated-types";

export type Manifold = EncapsulatedTypes.Manifold;
export type CrossSection = EncapsulatedTypes.CrossSection;
export type Mesh = EncapsulatedTypes.Mesh;

const wasm = await Module({
	locateFile: () => manifoldWasmUrl,
});
wasm.setup();

export const Manifold = wasm.Manifold;
export const CrossSection = wasm.CrossSection;
export const Mesh = wasm.Mesh;