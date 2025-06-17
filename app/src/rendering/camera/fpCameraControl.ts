import { Camera } from "three";
import { FpCameraState } from "./fpCameraState";
import { KeyManager } from "./keyManager";

const radPerPixel = 0.3 / 180 * Math.PI;

export class FpCameraControl {
	public readonly state: FpCameraState;
	private readonly keyManager = new KeyManager();

	private lastUpdateTime = Date.now();

	private lastDragPosition?: [number, number];

	constructor(
		element: HTMLElement,
		camera: Camera,
	) {
		this.state = new FpCameraState(camera);
		this.listenOnKeys(element);
	}

	public animate() {
		const lastTime = this.lastUpdateTime;
		this.lastUpdateTime = Date.now();
		const delta = Math.min((this.lastUpdateTime - lastTime) / 1000, 100);
		if (this.keyManager.isPressed("w") && !this.keyManager.isPressed("s")) {
			this.state.moveForward(delta, 1);
		} else if (this.keyManager.isPressed("s") && !this.keyManager.isPressed("w")) {
			this.state.moveForward(delta, -1);
		}
		if (this.keyManager.isPressed("d") && !this.keyManager.isPressed("a")) {
			this.state.moveRight(delta, -1);
		} else if (this.keyManager.isPressed("a") && !this.keyManager.isPressed("d")) {
			this.state.moveRight(delta, 1);
		}
		if (this.keyManager.isPressed("shift") && !this.keyManager.isPressed(" ")) {
			this.state.moveUp(delta, -1);
		} else if (this.keyManager.isPressed(" ") && !this.keyManager.isPressed("shift")) {
			this.state.moveUp(delta, 1);
		}
	}

	private listenOnKeys(el: HTMLElement) {
		el.tabIndex = 0;//Make the element selectable. Necessary to receive key presses.
		el.addEventListener("keydown", e => {
			this.keyManager.onPress(e.key);
		});
		el.addEventListener("keyup", e => {
			this.keyManager.onRelease(e.key);
		});
		el.addEventListener("mousedown", e => {
			if (e.button === 0) {
				this.lastDragPosition = [e.clientX, e.clientY];
			}
			if (e.button === 1) {
				if (document.pointerLockElement === el) {
					document.exitPointerLock();
				} else {
					el.requestPointerLock();
				}
			}
		});
		window.addEventListener("mouseup", e => {
			if (e.button === 0) {
				this.lastDragPosition = undefined;
			}
		});
		el.addEventListener("wheel", e => {
			if (e.deltaY > 0) {
				this.state.speedExp.value -= 1;
			} else if (e.deltaY < 0) {
				this.state.speedExp.value += 1;
			}
		}, { passive: true });
		window.addEventListener("mousemove", e => {
			if (this.lastDragPosition !== undefined) {
				const currentPosition: [number, number] = [e.clientX, e.clientY];//I could use movementX/Y here but it feels less natural
				const dx = currentPosition[0] - this.lastDragPosition[0];
				const dy = currentPosition[1] - this.lastDragPosition[1];
				this.state.rotate(-dx * radPerPixel, -dy * radPerPixel);
				this.lastDragPosition = currentPosition;
			}

			if (document.pointerLockElement === el) {
				const dx = e.movementX;
				const dy = e.movementY;
				this.state.rotate(-dx * radPerPixel, -dy * radPerPixel);
			}
		});
	}
}
