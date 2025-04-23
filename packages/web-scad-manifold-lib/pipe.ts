type Fn<A, B> = (input: A) => B;

interface Pipe {
	<T1>(v: T1): T1,
	<T1, T2>(v: T1, f1: Fn<T1, T2>): T2,
	<T1, T2, T3>(v: T1, f1: Fn<T1, T2>, f2: Fn<T2, T3>): T3,
	<T1, T2, T3, T4>(v: T1, f1: Fn<T1, T2>, f2: Fn<T2, T3>, f3: Fn<T3, T4>): T4,
	<T1, T2, T3, T4, T5>(v: T1, f1: Fn<T1, T2>, f2: Fn<T2, T3>, f3: Fn<T3, T4>, f4: Fn<T4, T5>): T5,
	<T1, T2, T3, T4, T5, T6>(v: T1, f1: Fn<T1, T2>, f2: Fn<T2, T3>, f3: Fn<T3, T4>, f4: Fn<T4, T5>, f5: Fn<T5, T6>): T6,
	<T>(v: T, ...fns: readonly Fn<T, T>[]): T,
}

export const pipe: Pipe = <T>(v: T, ...fns: readonly Fn<T, T>[]): T => {
	return fns.reduce((acc, fn) => fn(acc), v);
};
