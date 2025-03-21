import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, BufferGeometry, BufferAttribute } from "three";

import { Mesh as ManifoldMesh } from "web-scad-manifold-lib"

export class ResultRenderer {
    private readonly renderer = new WebGLRenderer({
        antialias: true,
    });
    private readonly scene = new Scene();

    public readonly display = this.renderer.domElement;

    public constructor() {
        const camera = new PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        camera.position.x = 2;
        camera.position.y = 1;
        camera.position.z = 5;

        this.renderer.setSize(800, 600);

        const animate = () => {
            this.renderer.render(this.scene, camera);
        }

        this.renderer.setAnimationLoop(animate);
    }


    public setContent(element: ManifoldMesh) {
        this.scene.clear();

        const material = new MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(element.vertProperties, 3));
        geometry.setIndex(Array.from(element.triVerts));
        const mesh = new Mesh(geometry, material);
        this.scene.add(mesh);
    }
}