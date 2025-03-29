export interface WebScadModule {
    main: WebScadMain;
}

export type WebScadMain = () => WebScadMainResult | Promise<WebScadMainResult | undefined> | undefined;

export type WebScadMainResult = WebScadObject;

export interface WebScadObject {
    readonly meshes: readonly WebScadMesh[];
}

export interface WebScadMesh {
    readonly type: "mesh",
    readonly vertices: Float32Array,
    readonly indices: Uint32Array,
    readonly color?: readonly [number, number, number] | readonly [number, number, number, number],
}