import Module from "manifold-3d";

import type * as EncapsulatedTypes from "manifold-3d/manifold-encapsulated-types";

export type Manifold = EncapsulatedTypes.Manifold;
export type CrossSection = EncapsulatedTypes.CrossSection;
export type Mesh = EncapsulatedTypes.Mesh;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const manifold3dWasmImportUrl: string | undefined = (globalThis as any)["manifold3dWasmImportUrl"];

const wasm = await Module(manifold3dWasmImportUrl !== undefined ? {
	locateFile: () => manifold3dWasmImportUrl,
} : undefined);
wasm.setup();

export const Manifold = wasm.Manifold;
export const CrossSection = wasm.CrossSection;
export const Mesh = wasm.Mesh;
