import { WebScadExportable, WebScadMesh, WebScadObject } from "../common";
import { Manifold, Mesh } from "../internal/bindings";
import { ManifoldGc } from "../internal/manifoldGc";
import { Material } from "../material";
import { difference3d, intersect3d, union3d } from "./boolean3d";
import { setMaterial3d } from "./material3d";
import { mirror3d, mirrorCopy3d, rotate3d, scale3d, translate3d } from "./transform3d";
import { AnyVec3 } from "./vec3";

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

	public static readonly fromManifoldGc = (manifold: ManifoldGc, material: Material = Material.default) => new Object3D(new Map<Material, ManifoldGc>([[material, manifold]]));
	public static readonly fromManifold = (manifold: Manifold, material?: Material) => Object3D.fromManifoldGc(new ManifoldGc(manifold), material);

	public static readonly fromMesh = (vertexPositions: Float32Array, indices: Uint32Array): Object3D => {
		const mesh = new Mesh({
			numProp: 3,
			vertProperties: vertexPositions,
			triVerts: indices,
		});

		return Object3D.fromManifold(new Manifold(mesh));
	};

	public readonly applyOnEachManifold = (operation: (input: Manifold) => Manifold): Object3D => {
		const resultByMaterial = new Map<Material, ManifoldGc>();

		for (const [material, manifold] of this.manifoldsByMaterial) {
			resultByMaterial.set(
				material,
				new ManifoldGc(operation(manifold.internal)),
			);
		}

		return new Object3D(resultByMaterial);
	};

	public readonly export = (): WebScadObject => {
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
	};

	public readonly apply = <T>(fn: (item: Object3D) => T) => fn(this);

	public readonly boundingBox = (): Box3d => this.fullManifold.internal.boundingBox();
	public readonly isEmpty = (): boolean => this.fullManifold.internal.isEmpty();
	public readonly surfaceArea = (): number => this.fullManifold.internal.surfaceArea();
	public readonly volume = (): number => this.fullManifold.internal.volume();

	public readonly translate = (offset: AnyVec3) => translate3d(this, offset);
	public readonly rotate = (rotation: AnyVec3) => rotate3d(this, rotation);
	public readonly mirror = (normal: AnyVec3) => mirror3d(this, normal);
	public readonly mirrorCopy = (normal: AnyVec3) => mirrorCopy3d(this, normal);
	public readonly scale = (scale: number | AnyVec3) => scale3d(this, scale);

	public readonly difference = (...others: readonly Object3D[]) => difference3d(this, ...others);
	public readonly union = (...others: readonly Object3D[]) => union3d(this, ...others);
	public readonly intersect = (...others: readonly Object3D[]) => intersect3d(this, ...others);

	public readonly setMaterial = (material: Material) => setMaterial3d(this, material);
}

export interface Box3d {
	min: [number, number, number],
	max: [number, number, number],
};
