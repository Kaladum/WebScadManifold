export const sleep = (timeMs: number) => new Promise<void>(resolve => {
	setTimeout(() => resolve(), timeMs);
});