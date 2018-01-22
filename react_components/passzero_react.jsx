import React from "react";
import ReactDOM from "react-dom";

// components
import PassZero from "./top_level.jsx";

// javascript helpers
//import PassZeroAPI from "./passzero_api.js";
//import Utils from "./passzero_utils.js";

/**
 * This file is responsible for the UI aspects of the PassZero Chrome extension
 * Each element
 */

ReactDOM.render(
	<PassZero />,
	document.getElementById("passzero-app")
);
