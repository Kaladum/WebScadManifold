import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, BufferGeometry, BufferAttribute, MeshPhongMaterial, AmbientLight, DirectionalLight, Color, Object3D, Vector3 } from "three";
import { WebScadObject } from "web-scad-manifold-lib";

import { FlyControls } from 'three/addons/controls/FlyControls.js';

Object3D.DEFAULT_UP = new Vector3(0, 0, 1);

export class ResultRenderer {
    private readonly renderer = new WebGLRenderer({
        antialias: true,
    });
    public readonly canvas = this.renderer.domElement;
    private readonly scene = new Scene();
    public readonly container = document.createElement("div");
    private readonly camera = new PerspectiveCamera(75, 1, 0.1, 10_000);
    private readonly controls = new FlyControls(this.camera, this.container);

    public constructor() {
        this.container.classList.add("render-container");
        this.container.append(this.canvas);

        this.scene.background = new Color(0xffffff);

        this.camera.position.x = 200;
        this.camera.position.y = 0;
        this.camera.position.z = 0;

        this.camera.lookAt(0, 0, 0);

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

        for (const inputMesh of element.meshes) {
            let color = new Color(0.56, 0.66, 0.2);
            if (inputMesh.color !== undefined) {
                color = new Color(inputMesh.color[0], inputMesh.color[1], inputMesh.color[2]);
            }
            const material = new MeshPhongMaterial({
                color,
                flatShading: true,
            });
            const geometry = new BufferGeometry();
            geometry.setAttribute("position", new BufferAttribute(inputMesh.vertices, 3));
            geometry.setIndex(Array.from(inputMesh.indices));
            geometry.computeVertexNormals();
            const mesh = new Mesh(geometry, material);
            this.scene.add(mesh);
        }


        this.scene.add(new AmbientLight(0xffffff, 0.1));

        {
            const directionalLight = new DirectionalLight(0xffffff, 0.6);
            directionalLight.position.set(100, 100, 100);
            this.scene.add(directionalLight);
        }

        {
            const directionalLight = new DirectionalLight(0xffffff, 0.6);
            directionalLight.position.set(-70, 50, -20);
            this.scene.add(directionalLight);
        }

    }
}