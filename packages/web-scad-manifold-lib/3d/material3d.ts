import { Object3D } from "./object3d";
import { Material } from "../material";

export const setMaterial3d = (obj: Object3D, material: Material) => Object3D.fromManifoldGc(obj.fullManifold, material);
