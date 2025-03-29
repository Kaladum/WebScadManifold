import { Object3D } from "./object3d";
import { Material } from "../material";

export const setMaterial3d = (material: Material) => (obj: Object3D) => Object3D.fromManifoldGc(obj.fullManifold, material);
