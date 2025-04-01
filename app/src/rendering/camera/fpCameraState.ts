import { Camera, Euler, Quaternion, Vector3 } from "three";

export class FpCameraState {
    public constructor(
        private readonly camera: Camera
    ) {
        this.camera.quaternion.copy(this.baseQuaternion);
    }

    private readonly baseQuaternion = new Quaternion().setFromEuler(new Euler(90 / 180 * Math.PI, -90 / 180 * Math.PI, 0));
    private readonly lookRotation = new Euler(0, 0, 0, "ZYX");

    public unitsPerSecond = 50;

    public applyMovementRotated(movement: Vector3) {
        const rotatedMovement = movement.clone().applyEuler(new Euler(0, 0, this.lookRotation.y));
        this.camera.position.add(rotatedMovement);
    }

    public moveForward(time: number, factor: number/**Can be used to move in the opposite direction */) {
        this.applyMovementRotated(new Vector3(this.unitsPerSecond * time * factor, 0, 0));
    }

    public moveRight(time: number, factor: number /**factor Can be used to move in the opposite direction*/) {
        this.applyMovementRotated(new Vector3(0, this.unitsPerSecond * time * factor, 0));
    }

    public moveUp(time: number, factor: number /**factor Can be used to move in the opposite direction*/) {
        this.camera.position.z += this.unitsPerSecond * time * factor
    }

    public rotate(rollYaw: number, rollPitch: number) {
        this.lookRotation.y += rollYaw;
        this.lookRotation.x = clamp(this.lookRotation.x + rollPitch, -Math.PI / 2, Math.PI / 2);

        const lookQuaternion = new Quaternion().setFromEuler(this.lookRotation);

        const fullQuaternion = this.baseQuaternion.clone().multiply(lookQuaternion);
        this.camera.quaternion.copy(fullQuaternion);
    }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);