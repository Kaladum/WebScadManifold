import { ResolvablePromise } from "./resolvablePromise";

export interface IEventSender<T> {
	addListener(listener: (event: T) => void): IStoppableListener,
	addListenerForObjectLifetime<TTarget extends object>(listener: (event: T, target: TTarget) => void, target: TTarget): IStoppableListener,
	readonly nextEvent: Promise<T>,
	iterate(): AsyncIterable<T>,
	waitForSpecificEvent(relevant: (event: T) => boolean): Promise<T>,
}

export interface IStoppableListener {
	readonly isStopped: boolean,
	stopListening(): void,
}

export type IEventListener<T> = (event: T) => void;

class BasicSender<T> implements IEventSender<T> {
	private readonly listeners = new Set<IEventListener<T>>();
	protected _nextEvent = new ExtendedResolvablePromise<T>();
	private readonly listenerFinalizationRegistry = new FinalizationRegistry<IStoppableListener>((listener) => {
		if (!listener.isStopped) {
			listener.stopListening();
		}
	});

	public addListener(listener: IEventListener<T>): IStoppableListener {
		if (this.listeners.has(listener)) {
			throw new Error("Listener is already attached");
		}
		this.listeners.add(listener);
		const activeListener = {
			stopListening: () => {
				if (this.listeners.has(listener)) {
					this.listeners.delete(listener);
					activeListener.isStopped = true;
				} else {
					throw new Error("Event listening is already stopped.");
				}
			},
			isStopped: false,
		};
		return activeListener;
	}

	public addListenerForObjectLifetime<TTarget extends object>(
		listener: (event: T, target: TTarget) => void,
		target: TTarget,
	): IStoppableListener {
		const targetWeakRef = new WeakRef(target);
		const activeListener = this.addListener((event) => {
			const targetStrongRef = targetWeakRef.deref();
			if (targetStrongRef !== undefined) {
				listener(event, targetStrongRef);
			}
		});
		this.listenerFinalizationRegistry.register(target, activeListener);
		return activeListener;
	}

	protected send(eventObject: T): void {
		for (const listener of this.listeners) {
			listener(eventObject);
		}
		const oldEvent = this._nextEvent;
		this._nextEvent = new ExtendedResolvablePromise();
		oldEvent.nextPromise = this._nextEvent;
		oldEvent.resolve(eventObject);
	}

	public get nextEvent(): Promise<T> {
		return this._nextEvent;
	}

	public async* iterate(): AsyncIterable<T> {
		let currentPromise = this._nextEvent;
		while (true) {
			const value = await currentPromise;
			currentPromise = currentPromise.nextPromise as ExtendedResolvablePromise<T>;
			yield value;
		}
	}

	public async waitForSpecificEvent(relevant: (event: T) => boolean): Promise<T> {
		for await (const e of this.iterate()) {
			if (relevant(e)) {
				return e;
			}
		}
		throw new Error("Unreachable");
	}
}

export class EventSender<T> extends BasicSender<T> {
	public send(eventObject: T): void {
		super.send(eventObject);
	}
}


class ExtendedResolvablePromise<T> extends ResolvablePromise<T> {
	public nextPromise: ExtendedResolvablePromise<T> | undefined;
}