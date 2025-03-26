import { WebScadMainResult } from "web-scad-manifold-lib";

export class ModelCalculationStateManager {
    public currentState: ModelStateLoading | ModelStateReady = new ModelStateLoading();
}

export class ModelStateLoading { }

export class ModelStateReady {
    public constructor(
        public readonly model: WebScadMainResult,
    ) { }
}