import { MultiValue, WebScadMainResultInternal, WebScadObject } from "web-scad-manifold-lib";

export function iterateResultRecursive(result: WebScadMainResultInternal): Iterable<[WebScadObject, MultiValuePath]> {
	return iterateMultiValueRecursive(result, (v): v is WebScadObject => {
		return ("type" in v && v.type === "object");
	});
}

export type MultiValuePath = readonly (number | string)[];

export function* iterateMultiValueRecursive<T>(data: MultiValue<T>, isValue: (v: MultiValue<T>) => v is T): Iterable<[T, MultiValuePath]> {
	if (isValue(data)) {
		yield [data, []];
	} else if (data instanceof Array) {
		for (const [i, item] of data.entries()) {
			for (const [child, childPath] of iterateMultiValueRecursive(item, isValue)) {
				yield ([child, [i, ...childPath]]);
			}
		}
	} else {
		for (const [key, item] of Object.entries(data)) {
			for (const [child, childPath] of iterateMultiValueRecursive(item, isValue)) {
				yield ([child, [key, ...childPath]]);
			}
		}
	}
}