import globals from "globals";
import pluginJs from "@eslint/js";

export default [
	pluginJs.configs.recommended,
	{
		files: ["**/*.js"],
		languageOptions: {
			sourceType: "commonjs",
		},
	},
	{
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		rules: {
			"no-unused-vars": "warn",
			"no-undef": "error",
			"no-unreachable": "warn",
			"no-var": "warn",
			"no-useless-return": "warn",
			"no-unused-expressions": "warn",
		},
	},
];
