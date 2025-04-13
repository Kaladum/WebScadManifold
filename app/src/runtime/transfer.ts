import { WebScadMainResultInternal } from "web-scad-manifold-lib";
import { WebScadMultiParameterInternal } from "./type";

export interface WebScadRunResult {
	readonly model?: WebScadMainResultInternal,
	readonly parameters?: WebScadMultiParameterInternal,
}