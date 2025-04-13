abstract class BaseParameter<TValue, TType> {
	public readonly isParameter = true;
	public abstract readonly parameterType: TType;

	public constructor(protected _value: TValue) { }

	public get value(): TValue {
		return this._value;
	}

	public abstract trySetValue(value: unknown): boolean;
}

export class NumberParameter extends BaseParameter<number, "number"> {
	public readonly parameterType = "number";

	public constructor(options: {
		readonly value: number,
	}) {
		super(options.value);
	}

	public trySetValue(value: unknown): boolean {
		if (typeof value !== "number") return false;
		this._value = value;
		return true;
	}
}

export type Parameter = NumberParameter;