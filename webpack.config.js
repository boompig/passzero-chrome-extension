var webpack = require("webpack");
var path = require("path");

var BUILD_DIR = path.resolve(__dirname, "dist/js");
var APP_DIR = path.resolve(__dirname, "src");

var config = {
	entry: APP_DIR + "/passzero_react.jsx",
	output: {
		path: BUILD_DIR,
		filename: "passzero_extension.js"
	},
	resolve: {
		extensions: [".jsx", ".js"]
	},
	module: {
		loaders: [
			{
				test: /\.jsx?/,
				include: APP_DIR,
				loader: "babel-loader",
			}
		]
	}
};

module.exports = config;
