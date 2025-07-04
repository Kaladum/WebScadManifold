import { cube, sphere, WebScadMain, WebScadParameters } from "web-scad-manifold-lib";

export const parameters = {} satisfies WebScadParameters;

export const main: WebScadMain = () => {
	return cube([100, 100, 100], true)
		.difference(
			sphere(45, 20).translate([0, 0, 20]),
		)
		.rotate([0, 0, 45])
		.translate([100, 0, -60]);
};