import * as z from "zod";
import { createMultiSchema } from "./multi";
import { MultiValuePath } from "../../utils/multiObject";

const createBaseParameterSchema = <TType extends string, TValue>(type: TType, valueType: z.ZodType<TValue>) => z.object({
	isParameter: z.literal(true),
	parameterType: z.literal(type),
	value: valueType,
});

const numberParameterSchema = createBaseParameterSchema("number", z.number());
export type WebScadNumberParameterInternal = z.infer<typeof numberParameterSchema>;


export const WebScadSingleParameterSchema = numberParameterSchema;

export type WebScadSingleParameterInternal = z.infer<typeof WebScadSingleParameterSchema>;

export const WebScadMultiParameterSchema = createMultiSchema<WebScadNumberParameterInternal>(WebScadSingleParameterSchema);
export type WebScadMultiParameterInternal = z.infer<typeof WebScadMultiParameterSchema>;

export type ParameterValue = number;

export class ParameterStore {
	private readonly lastKnownValues = new Map<string, ParameterValue>();

	public setValue(value: ParameterValue, path: MultiValuePath) {
		this.lastKnownValues.set(JSON.stringify(path), value);
	}

	public getValueOrUndefined(path: MultiValuePath): ParameterValue | undefined {
		return this.lastKnownValues.get(JSON.stringify(path));
	}

	public serialize(): ReadonlyMap<string, ParameterValue> {
		return this.lastKnownValues;
	}
}