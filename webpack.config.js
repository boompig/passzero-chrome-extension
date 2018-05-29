const webpack = require("webpack");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "dist/js");
const APP_DIR = path.resolve(__dirname, "src");

const config = {
	mode: "production",
	entry: APP_DIR + "/passzero_react.jsx",
	output: {
		path: BUILD_DIR,
		filename: "passzero_extension.js"
	},
	resolve: {
		extensions: [".jsx", ".js"]
	},
	module: {
		rules: [
			{
				test: /\.jsx?/,
				include: APP_DIR,
				loader: "babel-loader",
			}
		]
	}
};

module.exports = config;
