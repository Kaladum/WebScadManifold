import { Parameter } from "./parameter";

export interface WebScadModule {
	main: WebScadMain,
	parameters: WebScadParameters,
}

export type WebScadMain = () => WebScadMainResult | Promise<WebScadMainResult | undefined> | undefined;

export type WebScadMainResult = MultiValue<WebScadObject | WebScadExportable<WebScadObject>>;

export type WebScadMainResultInternal = MultiValue<WebScadObject>;

export type MultiValue<T> = T | readonly MultiValue<T>[] | MultiValueObject<T>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MultiValueObject<T> extends Readonly<Record<string, MultiValue<T>>> { }

export interface WebScadObject {
	readonly type: "object",
	readonly meshes: readonly WebScadMesh[],
}

export interface WebScadMesh {
	readonly type: "mesh",
	readonly vertices: Float32Array,
	readonly indices: Uint32Array,
	readonly color?: readonly [number, number, number] | readonly [number, number, number, number],
}

export interface WebScadExportable<T> {
	readonly isAWebScadExportableValue: true,
	export(): T,
}

export type WebScadParameters = MultiValue<Parameter>;