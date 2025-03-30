export interface WebScadModule {
    main: WebScadMain;
}

export type WebScadMain = () => WebScadMainResult | Promise<WebScadMainResult | undefined> | undefined;


export type WebScadMainResult = WebScadObjectMulti;

export type WebScadObjectMulti = WebScadObject | readonly WebScadMainResult[] | WebScadMainResultMultiObject;

interface WebScadMainResultMultiObject extends Readonly<Record<string, WebScadMainResult>> { }


export interface WebScadObject {
    readonly type: "object",
    readonly meshes: readonly WebScadMesh[];
}

export interface WebScadMesh {
    readonly type: "mesh",
    readonly vertices: Float32Array,
    readonly indices: Uint32Array,
    readonly color?: readonly [number, number, number] | readonly [number, number, number, number],
}