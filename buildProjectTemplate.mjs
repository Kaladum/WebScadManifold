// @ts-check

import * as fs from "fs/promises";
import { archiveFolder } from "zip-lib";

//Create template folders
await fs.mkdir("./projectTemplate/types").catch(() => false);
await fs.mkdir("./projectTemplate/types/manifold-3d").catch(() => false);

//Copy web-scad-manifold-lib definitions
await fs.copyFile("./packages/web-scad-manifold-lib/dist/web-scad-manifold-lib.d.ts", "./projectTemplate/types/web-scad-manifold-lib.d.ts");

//Copy manifold-3d definitions
await fs.copyFile("./node_modules/manifold-3d/manifold.d.ts", "./projectTemplate/types/manifold-3d/manifold.d.ts");
await fs.copyFile("./node_modules/manifold-3d/manifold-global-types.d.ts", "./projectTemplate/types/manifold-3d/manifold-global-types.d.ts");
await fs.copyFile("./node_modules/manifold-3d/manifold-encapsulated-types.d.ts", "./projectTemplate/types/manifold-3d/manifold-encapsulated-types.d.ts");

//create public dir
await fs.mkdir("./app/public").catch(() => false);

//create template zip
await archiveFolder("./projectTemplate", "./app/public/web-scad-manifold-template.zip");
