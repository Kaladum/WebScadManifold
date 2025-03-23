import { Scene, PerspectiveCamera, WebGLRenderer, MeshBasicMaterial, Mesh, BufferGeometry, BufferAttribute } from "three";
import { WebScadObject } from "web-scad-manifold-lib/common";

import { FlyControls } from 'three/addons/controls/FlyControls.js';

export class ResultRenderer {
    private readonly renderer = new WebGLRenderer({
        antialias: true,
    });
    private readonly scene = new Scene();
    public readonly container = document.createElement("div");
    private readonly camera = new PerspectiveCamera(75, 1, 0.1, 10_000);
    private readonly controls = new FlyControls(this.camera, this.container);

    public constructor() {
        this.container.classList.add("render-container");
        this.container.append(this.renderer.domElement);

        this.camera.position.x = 50;
        this.camera.position.y = -30;
        this.camera.position.z = 250;

        this.controls.movementSpeed = 200;
        this.controls.rollSpeed = Math.PI / 2;
        this.controls.autoForward = false;
        this.controls.dragToLook = true;

        const animate = () => {
            this.controls.update(0.01);
            const size = this.container.getBoundingClientRect();
            this.renderer.setSize(size.width, size.height);
            this.camera.aspect = size.width / size.height;
            this.camera.updateProjectionMatrix();//TODO Only call if necessary
            this.renderer.render(this.scene, this.camera);
        }

        this.renderer.setAnimationLoop(animate);
    }

    public setContent(element: WebScadObject) {
        this.scene.clear();

        const material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(element.vertices, 3));
        geometry.setIndex(Array.from(element.indices));
        const mesh = new Mesh(geometry, material);
        this.scene.add(mesh);
    }
}