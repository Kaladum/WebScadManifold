import { ResolvablePromise } from "./resolvablePromise";

const listenerFinalizationRegistry = new FinalizationRegistry<IStoppableListener>((listener) => {
	if (!listener.isStopped) {
		listener.stopListening();
	}
});

export interface IEventSender<T> extends AsyncIterable<T> {
	addListener(listener: (event: T) => void): IStoppableListener,
	addListenerForObjectLifetime<TTarget extends object>(
		listener: (event: T, target: TTarget) => void,
		target: TTarget,
	): IStoppableListener,
}

export interface IStoppableListener {
	readonly isStopped: boolean,
	stopListening(): void,
}

export type IEventListener<T> = (event: T) => void;

class BasicSender<T> implements IEventSender<T> {
	private readonly listeners = new Set<IEventListener<T>>();
	protected _nextEvent = new ResolvablePromise<T>();

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
			} else {
				console.log("Target has been deleted by GC");
			}
		});
		listenerFinalizationRegistry.register(target, activeListener);
		return activeListener;
	}

	protected send(eventObject: T): void {
		for (const listener of this.listeners) {
			listener(eventObject);
		}
		const oldEvent = this._nextEvent;
		this._nextEvent = new ResolvablePromise();
		oldEvent.resolve(eventObject);
	}

	public get nextEvent(): Promise<T> {
		return this._nextEvent;
	}

	[Symbol.asyncIterator](): AsyncIterator<T> {
		return {
			next: async (): Promise<IteratorResult<T>> => {
				const value = await this.nextEvent;
				return {
					done: true,
					value,
				};
			},
		};
	}
}

export class EventSender<T> extends BasicSender<T> {
	public send(eventObject: T): void {
		super.send(eventObject);
	}
}
