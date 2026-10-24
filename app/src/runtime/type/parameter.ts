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

const stringParameterSchema = createBaseParameterSchema("string", z.string());
export type WebScadStringParameterInternal = z.infer<typeof stringParameterSchema>;

const boolParameterSchema = createBaseParameterSchema("boolean", z.boolean());
export type WebScadBooleanParameterInternal = z.infer<typeof boolParameterSchema>;


export const WebScadSingleParameterSchema = z.union([numberParameterSchema, stringParameterSchema, boolParameterSchema]);

export type WebScadSingleParameterInternal = z.infer<typeof WebScadSingleParameterSchema>;

export const WebScadMultiParameterSchema = createMultiSchema<WebScadSingleParameterInternal>(WebScadSingleParameterSchema);
export type WebScadMultiParameterInternal = z.infer<typeof WebScadMultiParameterSchema>;

export type ParameterValue = number | string | boolean;

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