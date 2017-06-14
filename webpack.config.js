const webpack = require("webpack");
const path = require("path");

const APP_DIR = path.resolve(__dirname, "react_components");
const BUILD_DIR = path.resolve(__dirname, "build");
const DIST_DIR = path.resolve(__dirname, "dist/js");

let config = {
    entry: APP_DIR + "/passzero_react.tsx",
    output: {
        path: DIST_DIR,
        filename: "passzero_extension.js"
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                include: APP_DIR,
                loader: "ts-loader",
                options: {
                    configFileName: "tsconfig.json"
                }
            },
            {
                test: /\.jsx?$/,
                include: BUILD_DIR,
                loader: "babel-loader"
            }
        ]
    }
};

module.exports = config;
