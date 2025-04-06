function textModifier(element: HTMLElement, options: CElementOptions) {
	if (options.text !== undefined) {
		element.textContent = options.text;
	}
}

function childrenModifier(element: HTMLElement, options: CElementOptions) {
	if (options.children !== undefined) {
		element.append(...options.children);
	}
}

function classModifier(element: HTMLElement, options: CElementOptions) {
	if (typeof options.class === "string") {
		element.classList.add(options.class);
	} else if (options.class instanceof Array) {
		element.classList.add(...options.class);
	}
}

function eventModifier(element: HTMLElement, options: CElementOptions) {
	if (options.onClick !== undefined) {
		const onClick = options.onClick;
		element.addEventListener("click", (e) => onClick(e));
	}
	if (options.onClickHandled !== undefined) {
		const onClickHandled = options.onClickHandled;
		element.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			onClickHandled(e);
		});
	}
}

function customModifier(element: HTMLElement, options: CElementOptions) {
	for (const customHandler of options.custom ?? []) {
		customHandler(element);
	}
}

const basicModifiers: readonly ElementModifier<HTMLElement, CElementOptions>[] = [
	textModifier,
	childrenModifier,
	classModifier,
	eventModifier,
	customModifier,
];

export const cDiv = cElement<HTMLDivElement, CElementOptions>(() => document.createElement("div"), [...basicModifiers], {});
export const cSpan = cElement<HTMLSpanElement, CElementOptions>(() => document.createElement("span"), [...basicModifiers], {});
export const cButton = cElement<HTMLButtonElement, CElementOptions>(() => document.createElement("button"), [...basicModifiers], {});
export const cText = (text: string) => document.createTextNode(text);
export const cBr = () => document.createElement("br");

export interface CElementOptions {
	readonly text?: string,
	readonly children?: Iterable<Node>,
	readonly class?: string | string[],
	readonly onClick?: (event: MouseEvent) => void,
	readonly onClickHandled?: (event: MouseEvent) => void,
	readonly custom?: readonly ((element: HTMLElement) => void)[],
}

function cElement<TElement, TOptions>(
	provider: () => TElement,
	modifiers: ElementModifier<TElement, TOptions>[],
	defaultOptions: TOptions,
): (options?: TOptions) => TElement {
	return (options: TOptions = defaultOptions) => {
		const element = provider();
		for (const modifier of modifiers) {
			modifier(element, options);
		}
		return element;
	};
}

export function uElement<TElement extends HTMLElement>(
	element: TElement,
	options: CElementOptions,
): TElement {
	for (const modifier of basicModifiers) {
		modifier(element, options);
	}
	return element;
}

type ElementModifier<TElement, TOptions> = (
	element: TElement,
	options: TOptions,
) => void;
