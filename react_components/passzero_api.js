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

    /**
     * Authenticate given user using PassZero API. Return a promise.
     */
    validateLogin: function (email, password) {
        var data = { email: email, password: password };
        return $.postJSON(PassZeroAPI.apiBaseURL + "/login", data);
    },
    getCSRFToken: function () {
        return $.getJSON(PassZeroAPI.apiBaseURL + "/csrf_token");
    },
    _deleteEntry: function (entry_id, csrf_token) {
        var params = { csrf_token: csrf_token };
        var url = PassZeroAPI.apiBaseURL + "/entries/" + entry_id;
        return $.deleteJSON(url, params);
    },
    deleteEntry: function (entry_id) {
        return PassZeroAPI.getCSRFToken()
        .then(function(response) {
            return PassZeroAPI._deleteEntry(entry_id, response);
        });
    },
    /**
     * Get entries using PassZero API. Return a promise.
     */
    getEntries: function () {
        return $.getJSON(PassZeroAPI.apiBaseURL + "/entries");
    },
    logout: function () {
        return $.postJSON(PassZeroAPI.apiBaseURL + "/logout");
    }
};

if (module && module.exports) {
    module.exports = PassZeroAPI;
}
