module.exports = {
	"parser": "babel-eslint",
	"env": {
		"browser": true,
		"es6": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:react/recommended"
	],
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module",
		"ecmaFeatures": {
			"experimentalObjectRestSpread": true,
			"jsx": true
		}
	},
	"plugins": [
		"react"
	],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"no-console": [
			"error",
			{ "allow": ["warn", "error"] }
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		]
	},
	"globals": {
		// need this because don't have a type file
		"chrome": true,
		// because of flow
		"SyntheticEvent": true,
		// this is what Firefox uses for its WebExtension cookies API
		"cookies": true
	}
};
