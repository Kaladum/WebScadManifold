import { WebScadMainResultInternal, WebScadObject } from "web-scad-manifold-lib";

export type TypePath = readonly (number | string)[];

export function* iterateResultRecursive(result: WebScadMainResultInternal): Iterable<[WebScadObject, TypePath]> {
    if ("type" in result && result.type === "object") {
        yield [result as WebScadObject, []];
    } else if (result instanceof Array) {
        for (const [i, item] of result.entries()) {
            for (const [child, childPath] of iterateResultRecursive(item)) {
                yield ([child, [i, ...childPath]]);
            }
        }
    } else {
        for (const [key, item] of Object.entries(result)) {
            for (const [child, childPath] of iterateResultRecursive(item)) {
                yield ([child, [key, ...childPath]]);
            }
        }
    }
}