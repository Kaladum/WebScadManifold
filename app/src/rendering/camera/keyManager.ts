export class KeyManager {
    private readonly pressedKeys = new Set<string>();

    public onPress(key: string) {
        this.pressedKeys.add(key.toLowerCase());
    }

    public onRelease(key: string) {
        this.pressedKeys.delete(key.toLowerCase());
    }

    public isPressed = (key: string) => this.pressedKeys.has(key);
}