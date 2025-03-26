export class ResolvablePromise<T> extends Promise<T> {
    protected _resolve: (value: T) => void;
    protected _reject: (value: unknown) => void;

    protected _isDone = false;

    public get isDone(): boolean {
        return this._isDone;
    }

    public constructor() {
        let innerResolve: ((value: T) => void) | undefined = undefined;
        let innerReject: ((value: unknown) => void) | undefined = undefined;
        super((resolve, reject) => {
            innerResolve = resolve;
            innerReject = reject;
        });

        this._resolve = innerResolve!;
        this._reject = innerReject!;
    }

    public resolve(value: T): void {
        if (this._isDone) throw new Error("Promise is already done!");
        this._isDone = true;
        this._resolve(value);
    }

    public reject(error: unknown): void {
        if (this._isDone) throw new Error("Promise is already done!");
        this._isDone = true;
        this._reject(error);
    }

    static get [Symbol.species]() {
        return Promise;
    }

    get [Symbol.toStringTag]() {
        return "ResolvablePromise";
    }
}