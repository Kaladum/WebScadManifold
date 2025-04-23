import { Manifold } from "./bindings";

const deleteManifoldRegistry = new FinalizationRegistry<Manifold>((manifold) => {
	manifold.delete();
});

export class ManifoldGc {
	public constructor(
		public readonly internal: Manifold,
	) {
		deleteManifoldRegistry.register(this, internal);
	}
}
