function textModifier<TElement extends HTMLElement>(element: TElement, options: CElementOptions<TElement>) {
	if (options.text !== undefined) {
		element.textContent = options.text;
	}
}

function childrenModifier<TElement extends HTMLElement>(element: TElement, options: CElementOptions<TElement>) {
	if (options.children !== undefined) {
		element.append(...options.children);
	}
}

function classModifier<TElement extends HTMLElement>(element: TElement, options: CElementOptions<TElement>) {
	if (typeof options.class === "string") {
		element.classList.add(options.class);
	} else if (options.class instanceof Array) {
		element.classList.add(...options.class);
	}
}

function eventModifier<TElement extends HTMLElement>(element: TElement, options: CElementOptions<TElement>) {
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

function customModifier<TElement extends HTMLElement>(element: TElement, options: CElementOptions<TElement>) {
	for (const customHandler of options.custom ?? []) {
		customHandler(element);
	}
}

function basicModifiers<TElement extends HTMLElement>(): readonly ElementModifier<TElement, CElementOptions<TElement>>[] {
	return [
		textModifier,
		childrenModifier,
		classModifier,
		eventModifier,
		customModifier,
	];
};

export interface AddHrefOptions {
	readonly href?: string,
}

function addHref(element: HTMLAnchorElement, options: AddHrefOptions) {
	if (options.href !== undefined) {
		element.href = options.href;
	}
}

export const cDiv = cElement<HTMLDivElement, CElementOptions<HTMLDivElement>>(() => document.createElement("div"), [...basicModifiers<HTMLDivElement>()], {});
export const cSpan = cElement<HTMLSpanElement, CElementOptions<HTMLSpanElement>>(() => document.createElement("span"), [...basicModifiers<HTMLSpanElement>()], {});
export const cButton = cElement<HTMLButtonElement, CElementOptions<HTMLButtonElement>>(() => document.createElement("button"), [...basicModifiers<HTMLButtonElement>()], {});
export const cA = cElement<HTMLAnchorElement, CElementOptions<HTMLAnchorElement> & AddHrefOptions>(() => document.createElement("a"), [...basicModifiers<HTMLAnchorElement>(), addHref], {});
export const cText = (text: string) => document.createTextNode(text);
export const cBr = () => document.createElement("br");

export interface CElementOptions<T> {
	readonly text?: string,
	readonly children?: Iterable<Node>,
	readonly class?: string | string[],
	readonly onClick?: (event: MouseEvent) => void,
	readonly onClickHandled?: (event: MouseEvent) => void,
	readonly custom?: readonly ((element: T) => void)[],
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
	options: CElementOptions<TElement>,
): TElement {
	for (const modifier of basicModifiers<TElement>()) {
		modifier(element, options);
	}
	return element;
}

type ElementModifier<TElement, TOptions> = (
	element: TElement,
	options: TOptions,
) => void;
