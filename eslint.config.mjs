// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylisticTs from "@stylistic/eslint-plugin-ts";

export default tseslint.config(
	{
		plugins: {
			"@stylistic/ts": stylisticTs,
		},
	},
	{
		ignores: [
			"app/dist/*",
			"packages/web-scad-manifold-lib/dist/*",
		],
	},
	eslint.configs.recommended,
	tseslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	{
		rules: {
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }],
			"@stylistic/ts/indent": ["warn", "tab"],
			"@stylistic/ts/comma-dangle": ["warn", "always-multiline"],
			"@stylistic/ts/semi": ["warn", "always"],
			"@stylistic/ts/quotes": ["warn", "double"],
			"@stylistic/ts/member-delimiter-style": ["warn", {
				"multiline": {
					"delimiter": "comma",
					"requireLast": true,
				},
				"singleline": {
					"delimiter": "comma",
					"requireLast": false,
				},
			}],
			"eqeqeq": ["warn", "always"],
		},
	},
);