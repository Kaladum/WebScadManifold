import { WebScadMesh, WebScadObject } from "../common";
import { Manifold } from "../internal/bindings";
import { ManifoldGc } from "../internal/manifoldGc";
import { Material } from "../material";

export class Object3D {
	public readonly fullManifold: ManifoldGc;

	public constructor(
		public readonly manifoldsByMaterial: ReadonlyMap<Material, ManifoldGc>,
	) {
		if (this.manifoldsByMaterial.size === 1) {
			// Just keep the Manifold of the only element
			this.fullManifold = this.manifoldsByMaterial.values().next().value!;
		} else {
			this.fullManifold = new ManifoldGc(Manifold.union([...this.manifoldsByMaterial.values()].map(v => v.internal)));
		}
	}

	public static fromManifoldGc = (manifold: ManifoldGc, material: Material = Material.default) => new Object3D(new Map<Material, ManifoldGc>([[material, manifold]]));
	public static fromManifold = (manifold: Manifold, material?: Material) => Object3D.fromManifoldGc(new ManifoldGc(manifold), material);

	public applyOnEachManifold = (operation: (input: Manifold) => Manifold): Object3D => {
		const resultByMaterial = new Map<Material, ManifoldGc>();

		for (const [material, manifold] of this.manifoldsByMaterial) {
			resultByMaterial.set(
				material,
				new ManifoldGc(operation(manifold.internal)),
			);
		}

		return new Object3D(resultByMaterial);
	};
}

export function convertToResult(obj3d: Object3D): WebScadObject {
	const meshes: WebScadMesh[] = [];

	for (const [material, manifold] of obj3d.manifoldsByMaterial) {//TODO Update
		const mesh = manifold.internal.getMesh();

		meshes.push({
			type: "mesh",
			vertices: mesh.vertProperties,
			indices: mesh.triVerts,
			color: material.color,
		});
	}

	return {
		meshes,
	};
}

// export interface ExportMesh {
// 	readonly type: "mesh",
// 	readonly vertices: Float32Array,
// 	readonly indices: Uint32Array,
// 	readonly color?: readonly [number, number, number, number],
// }
