import { Camera, Euler, Vector3 } from "three";
import { RWProperty } from "../../utils/property";

export class FpCameraState {
	public constructor(
		private readonly camera: Camera,
	) {
		this.camera.rotation.order = "ZXY";
		this.camera.rotation.x = Math.PI / 2;
	}

	public readonly speedExp = new RWProperty<number>(0);

	public get unitsPerSecond(): number {
		return 50 * Math.pow(1.2, this.speedExp.value);
	}

	public applyMovementRotated(movement: Vector3) {
		const rotatedMovement = movement.clone().applyEuler(new Euler(0, 0, this.camera.rotation.z));
		this.camera.position.add(rotatedMovement);
	}

	public moveForward(time: number, factor: number/**Can be used to move in the opposite direction */) {
		this.applyMovementRotated(new Vector3(0, this.unitsPerSecond * time * factor, 0));
	}

	public moveRight(time: number, factor: number /**factor Can be used to move in the opposite direction*/) {
		this.applyMovementRotated(new Vector3(this.unitsPerSecond * time * factor, 0, 0));
	}

	public moveUp(time: number, factor: number /**factor Can be used to move in the opposite direction*/) {
		this.camera.position.z += this.unitsPerSecond * time * factor;
	}

	public rotate(rollYaw: number, rollPitch: number) {
		this.camera.rotation.z += rollYaw;
		this.camera.rotation.x = clamp(this.camera.rotation.x + rollPitch, 0, Math.PI);
	}
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);