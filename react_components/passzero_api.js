var $ = require("jquery");

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

    _copy: function(obj) {
        var newObj = {};
        for (var k in obj) {
            newObj[k] = obj[k];
        }
        return newObj;
    },
    /**
     * Authenticate given user using PassZero API. Return a promise.
     */
    validateLogin: function(email, password) {
        var data = { email: email, password: password };
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
    _createEntry: function (entry, csrf_token) {
        var data = { entry: entry, csrf_token: csrf_token };
        return $.postJSON(PassZeroAPI.apiBaseURL + "/entries/new", data);
    },
    /**
     * Convenience method to create an entry in one step.
     * User must be logged in.
     */
    createEntry: function(entry) {
        return PassZeroAPI.getCSRFToken()
        .then(function(response) {
            return PassZeroAPI._createEntry(entry_id, response);
        })
    },
    _editEntry: function(entry_id, entry, csrf_token) {
        var url = PassZeroAPI.baseURL + "/entries/" + entry_id;
        var data = { entry: entry, csrf_token: csrf_token };
        return $.postJSON(url, data);
    },
    /**
     * Convenience method to edit an entry in one step.
     * User must be logged in.
     */
    editEntry: function(entry_id, entry) {
        return PassZeroAPI.getCSRFToken()
        .then(function(response) {
            return PassZeroAPI._editEntry(entry_id, entry, response);
        });
    },
    _deleteEntry: function(entry_id, csrf_token) {
        var params = { csrf_token: csrf_token };
        var url = PassZeroAPI.apiBaseURL + "/entries/" + entry_id;
        return $.deleteJSON(url, params);
    },
    /**
     * Convenience method to delete an entry in one step.
     * User must be logged in.
     */
    deleteEntry: function(entry_id) {
        return PassZeroAPI.getCSRFToken()
        .then(function(response) {
            return PassZeroAPI._deleteEntry(entry_id, response);
        });
    },
    logout: function() {
        return $.postJSON(PassZeroAPI.apiBaseURL + "/logout");
    }
};

if (module && module.exports) {
    module.exports = PassZeroAPI;
}
