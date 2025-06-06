import { WebScadExportable, WebScadMesh, WebScadObject } from "../common";
import { Manifold } from "../internal/bindings";
import { ManifoldGc } from "../internal/manifoldGc";
import { Material } from "../material";

export class Object3D implements WebScadExportable<WebScadObject> {
	public readonly fullManifold: ManifoldGc;
	public readonly isAWebScadExportableValue = true;

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

	public export(): WebScadObject {
		const meshes: WebScadMesh[] = [];

		for (const [material, manifold] of this.manifoldsByMaterial) {
			const mesh = manifold.internal.getMesh();

			meshes.push({
				type: "mesh",
				vertices: mesh.vertProperties,
				indices: mesh.triVerts,
				color: material.color,
			});
		}

		return {
			type: "object",
			meshes,
		};
	}

	public readonly boundingBox = (): Box3d => this.fullManifold.internal.boundingBox();
	public readonly isEmpty = (): boolean => this.fullManifold.internal.isEmpty();
	public readonly surfaceArea = (): number => this.fullManifold.internal.surfaceArea();
	public readonly volume = (): number => this.fullManifold.internal.volume();
}

export interface Box3d {
	min: [number, number, number],
	max: [number, number, number],
};

//TODO fromMesh