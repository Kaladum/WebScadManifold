import { WebScadMainResultInternal } from "web-scad-manifold-lib";

export class ModelCalculationStateManager {
	public currentState: ModelStateLoading | ModelStateReady = new ModelStateLoading();
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ModelStateLoading { }

export class ModelStateReady {
	public constructor(
		public readonly model: WebScadMainResultInternal,
	) { }
}