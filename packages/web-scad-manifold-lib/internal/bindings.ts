import Module, * as manifold3d from "manifold-3d";

export type Manifold = manifold3d.Manifold;
export type CrossSection = manifold3d.CrossSection;
export type Mesh = manifold3d.Mesh;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const manifold3dWasmImportUrl: string | undefined = (globalThis as any)["manifold3dWasmImportUrl"];

const wasm = await Module(manifold3dWasmImportUrl !== undefined ? {
	locateFile: () => manifold3dWasmImportUrl,
} : undefined);
wasm.setup();

//The .d.ts export looks silly if the types are not manually defined 
export const Manifold: manifold3d.ManifoldToplevel["Manifold"] = wasm.Manifold;
export const CrossSection: manifold3d.ManifoldToplevel["CrossSection"] = wasm.CrossSection;
export const Mesh: manifold3d.ManifoldToplevel["Mesh"] = wasm.Mesh;
