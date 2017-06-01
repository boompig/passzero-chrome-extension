const $ = require("jquery");

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

/**
 * Requires JQuery
 */
var PassZeroAPI = {
    baseURL: "https://passzero.herokuapp.com",

    apiBaseURL: "https://passzero.herokuapp.com/api",
    apiv2BaseURL: "https://passzero.herokuapp.com/api/v2",

    _copy: function(obj) {
        let newObj = {};
        for (let k in obj) {
            newObj[k] = obj[k];
        }
        return newObj;
    },
    /**
     * Authenticate given user using PassZero API. Return a promise.
     */
    validateLogin: function(email, password) {
        let data = { email: email, password: password };
        return $.postJSON(PassZeroAPI.apiBaseURL + "/login", data);
    },
    getCSRFToken: function() {
        return $.getJSON(PassZeroAPI.apiBaseURL + "/csrfToken");
    },
    /**
     * Get entries using PassZero API. Return a promise.
     * User must be logged in.
     */
    getEntries: function() {
        return $.getJSON(PassZeroAPI.apiBaseURL + "/entries");
    },
    /**
     * Get entries using PassZero API v2. Return a promise.
     * User must be logged in.
     */
    getEntriesv2: function() {
        return $.getJSON(PassZeroAPI.apiv2BaseURL + "/entries");
    },
    /**
     * Get entries using PassZero API v2. Return a promise.
     * User must be logged in.
     */
    getEntryv2: function(entryID) {
        return $.getJSON(PassZeroAPI.apiv2BaseURL + "/entries/" + entryID);
    },
    /**
     * Create a new entry given a CSRF token
     */
    _createEntry: function(entry, csrfToken) {
        let data = { entry: entry, csrfToken: csrfToken };
        return $.postJSON(PassZeroAPI.apiBaseURL + "/entries/new", data);
    },
    /**
     * Convenience method to create an entry in one step.
     * User must be logged in.
     */
    createEntry: function(entry) {
        return PassZeroAPI.getCSRFToken()
        .then(function(response) {
            return PassZeroAPI._createEntry(entry, response);
        });
    },
    _editEntry: function(entryID, entry, csrfToken) {
        const url = PassZeroAPI.baseURL + "/entries/" + entryID;
        let data = { entry: entry, csrfToken: csrfToken };
        return $.postJSON(url, data);
    },
    /**
     * Convenience method to edit an entry in one step.
     * User must be logged in.
     */
    editEntry: function(entryID, entry) {
        return PassZeroAPI.getCSRFToken()
        .then(function(response) {
            return PassZeroAPI._editEntry(entryID, entry, response);
        });
    },
    _deleteEntry: function(entryID, csrfToken) {
        const url = PassZeroAPI.apiBaseURL + "/entries/" + entryID;
        let params = { csrfToken: csrfToken };
        return $.deleteJSON(url, params);
    },
    /**
     * Convenience method to delete an entry in one step.
     * User must be logged in.
     */
    deleteEntry: function(entryID) {
        return PassZeroAPI.getCSRFToken()
        .then(function(response) {
            return PassZeroAPI._deleteEntry(entryID, response);
        });
    },
    logout: function() {
        return $.postJSON(PassZeroAPI.apiBaseURL + "/logout");
    }
};

if (module && module.exports) {
    module.exports = PassZeroAPI;
}
