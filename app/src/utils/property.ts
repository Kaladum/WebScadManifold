import { IEventSender, EventSender } from "./event";

export interface IBasicProperty<T> {
	readonly valueChanged: IEventSender<T>,
}

export abstract class BasicProperty<T> implements IBasicProperty<T> {
	protected readonly _valueChanged = new EventSender<T>();
	public get valueChanged(): IEventSender<T> {
		return this._valueChanged;
	}
}

export interface IRProperty<T> extends IBasicProperty<T> {
	get(): T,
	readonly value: T,
	isWritable(): this is IRWProperty<T>,
}

export class RProperty<T> extends BasicProperty<T> implements IRProperty<T> {
	private currentValue: T;

	public constructor(startValue: T) {
		super();
		this.currentValue = startValue;
	}

	public get(): T {
		return this.currentValue;
	}

	public get value(): T {
		return this.currentValue;
	}

	protected set(value: T) {
		this.currentValue = value;
		this._valueChanged.send(this.currentValue);
	}

	public isWritable(): this is IRWProperty<T> {
		return false;
	}
}


export interface IRWProperty<T> extends IRProperty<T> {
	set(value: T): void,
	value: T,
	isWritable(): this is IRWProperty<T> & true,
}

export class RWProperty<T> extends RProperty<T> implements IRWProperty<T> {
	public set(value: T) {
		super.set(value);
	}

	public get value(): T {//This duplication is necessary for some reason. Otherwise the value is undefined
		return this.get();
	}

	public set value(value: T) {
		super.set(value);
	}

	public isWritable(): this is IRWProperty<T> & true {
		return true;
	}
}