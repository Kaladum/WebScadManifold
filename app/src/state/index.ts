import { WebScadRunResult } from "../runtime/transfer";

export type ModelState = ModelStateInitializing | ModelStateOk | ModelStateCompilationFailed | ModelStateExecutionFailed;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ModelStateInitializing { }

export class ModelStateCompilationFailed {
	public constructor(public readonly error: unknown) { }
}

export class ModelStateExecutionFailed {
	public constructor(public readonly error: unknown) { }
}

export class ModelStateOk {
	public constructor(
		public readonly result: WebScadRunResult,
	) { }
}