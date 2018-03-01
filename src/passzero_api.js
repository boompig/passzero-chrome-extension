// @flow

import * as $ from "jquery";

$.postJSON = function(url, data) {
	data = data || {};
	return $.ajax({
		url: url,
		data: JSON.stringify(data),
		method: "POST",
		dataType: "json",
		contentType: "application/json"
	});
};

$.getJSON = function(url) {
	return $.ajax({
		url: url,
		method: "GET",
		dataType: "json",
		contentType: "application/json"
	});
};

$.deleteJSON = function(url, params) {
	if (params) {
		url += "?" + $.param(params);
	}
	return $.ajax({
		url: url,
		method: "DELETE",
		dataType: "json",
		contentType: "application/json"
	});
};

type T_Entry = any;

/**
 * Requires JQuery
 */
const PassZeroAPI = {
	baseURL: "https://passzero.herokuapp.com",

	apiBaseURL: "https://passzero.herokuapp.com/api",

	_copy: function(obj: any) {
		const newObj = {};
		for (let k in obj) {
			newObj[k] = obj[k];
		}
		return newObj;
	},
	/**
	 * Authenticate given user using PassZero API. Return a promise.
	 */
	validateLogin: function(email: string, password: string) {
		const data = { email: email, password: password };
		return $.postJSON(PassZeroAPI.apiBaseURL + "/login", data);
	},
	getCSRFToken: function() {
		return $.getJSON(PassZeroAPI.apiBaseURL + "/csrf_token");
	},
	/**
	 * Get entries using PassZero API. Return a promise.
	 * User must be logged in.
	 */
	getEntries: function() {
		return $.getJSON(PassZeroAPI.apiBaseURL + "/entries");
	},
	/**
	 * Create a new entry given a CSRF token
	 */
	_createEntry: function (entry: T_Entry, csrf_token: string) {
		const data = { entry: entry, csrf_token: csrf_token };
		return $.postJSON(PassZeroAPI.apiBaseURL + "/entries/new", data);
	},
	/**
	 * Convenience method to create an entry in one step.
	 * User must be logged in.
	 */
	createEntry: function(entry: T_Entry) {
		return PassZeroAPI.getCSRFToken()
			.done(function(response) {
				return PassZeroAPI._createEntry(entry, response);
			});
	},
	_editEntry: function(entry_id: number, entry: T_Entry, csrf_token: string) {
		const url = PassZeroAPI.baseURL + "/entries/" + entry_id;
		const data = { entry: entry, csrf_token: csrf_token };
		return $.postJSON(url, data);
	},
	/**
	 * Convenience method to edit an entry in one step.
	 * User must be logged in.
	 */
	editEntry: function(entry_id: number, entry: T_Entry) {
		return PassZeroAPI.getCSRFToken()
			.done(function(response) {
				return PassZeroAPI._editEntry(entry_id, entry, response);
			});
	},
	_deleteEntry: function(entry_id: number, csrf_token: string) {
		const params = { csrf_token: csrf_token };
		const url = PassZeroAPI.apiBaseURL + "/entries/" + entry_id;
		return $.deleteJSON(url, params);
	},
	/**
	 * Convenience method to delete an entry in one step.
	 * User must be logged in.
	 */
	deleteEntry: function(entry_id: number) {
		return PassZeroAPI.getCSRFToken()
			.done(function(response) {
				return PassZeroAPI._deleteEntry(entry_id, response);
			});
	},
	logout: function() {
		return $.postJSON(PassZeroAPI.apiBaseURL + "/logout");
	}
};


export default PassZeroAPI;
