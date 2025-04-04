import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, BufferGeometry, BufferAttribute, MeshPhongMaterial, AmbientLight, DirectionalLight, Color, Object3D, Vector3, Group } from "three";
import { WebScadMainResult } from "web-scad-manifold-lib";

import { FpCameraControl } from "./camera";
import { iterateResultRecursive } from "../utils/multiObject";
import { cDiv } from "../utils/jsml";

Object3D.DEFAULT_UP = new Vector3(0, 0, 1);

export class ResultRenderer {
    private readonly renderer = new WebGLRenderer({
        antialias: true,
    });
    public readonly canvas = this.renderer.domElement;
    private readonly scene = new Scene();
    public readonly container = cDiv({
        class: "render-container",
        children: [this.canvas],
    });
    private readonly camera = new PerspectiveCamera(75, 1, 0.1, 10_000);
    private readonly controls = new FpCameraControl(this.canvas, this.camera);

    private readonly modelGroup = new Group();

    public constructor() {
        this.scene.background = new Color(0xffffff);

        const animate = () => {
            this.controls.animate();
            const size = this.container.getBoundingClientRect();
            this.renderer.setSize(size.width, size.height);
            this.camera.aspect = size.width / size.height;
            this.camera.updateProjectionMatrix();//TODO Only call if necessary
            this.renderer.render(this.scene, this.camera);
        }

        this.renderer.setAnimationLoop(animate);

        this.scene.add(this.modelGroup);
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

    public setContent(result: WebScadMainResult) {
        this.modelGroup.clear();

        for (const [obj, _] of iterateResultRecursive(result)) {
            for (const inputMesh of obj.meshes) {
                let color = new Color(0.56, 0.66, 0.2);
                if (inputMesh.color !== undefined) {
                    color = new Color(inputMesh.color[0], inputMesh.color[1], inputMesh.color[2]);
                }
                const material = new MeshPhongMaterial({
                    color,
                    flatShading: true,
                    side: DoubleSide,
                });
                const geometry = new BufferGeometry();
                geometry.setAttribute("position", new BufferAttribute(inputMesh.vertices, 3));
                geometry.setIndex(Array.from(inputMesh.indices));
                geometry.computeVertexNormals();
                const mesh = new Mesh(geometry, material);
                this.modelGroup.add(mesh);
            }
        }
    }
}