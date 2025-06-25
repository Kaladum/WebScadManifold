import * as m from "web-scad-manifold-lib";

export const parameters = {} satisfies m.WebScadParameters;

export const main: m.WebScadMain = () => {
	return m.pipe(
		m.cube([100, 100, 100], true),
		m.difference3d(
			m.pipe(
				m.sphere(45, 20),
				m.translate3d([0, 0, 20]),
			),
		),
		m.rotate3d([0, 0, 45]),
		m.translate3d([100, 0, -60]),
	);
};