import { CrossSection } from "./bindings";

const deleteCrossSectionRegistry = new FinalizationRegistry<CrossSection>((manifold) => {
	manifold.delete();
});

export class CrossSectionGc {
	public constructor(
		public readonly internal: CrossSection,
	) {
		deleteCrossSectionRegistry.register(this, internal);
	}
}
