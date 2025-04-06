export interface WebScadModule {
	main: WebScadMain,
}

export type WebScadMain = () => WebScadMainResult | Promise<WebScadMainResult | undefined> | undefined;

export type WebScadMainResult = MultiResult<WebScadObject | WebScadExportable<WebScadObject>>;

export type WebScadMainResultInternal = MultiResult<WebScadObject>;

export type MultiResult<T> = T | readonly MultiResult<T>[] | MultiResultObject<T>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface MultiResultObject<T> extends Readonly<Record<string, MultiResult<T>>> { }

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