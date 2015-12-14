$.postJSON = function(url, data) {
    return $.ajax({
        url: url,
        data: JSON.stringify(data),
        method: "POST",
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
        return $.ajax({
            url: PassZeroAPI.apiBaseURL + "/csrf_token",
            dataType: "json",
            method: "GET"
        });
    },
    _deleteEntry: function (entry_id, csrf_token) {
        var data = { csrf_token: csrf_token };
        var url = PassZeroAPI.apiBaseURL + "/entries/" + entry_id + "?" + $.param(data);
        return $.ajax({
            url: url,
            dataType: "json",
            method: "DELETE"
        });
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
        return $.ajax({
            url: PassZeroAPI.apiBaseURL + "/entries",
            dataType: "json",
            method: "GET"
        });
    },
    logout: function () {
        return $.ajax({
            url: PassZeroAPI.apiBaseURL + "/logout",
            dataType: "json",
            method: "POST"
        });
    }
};

if (module && module.exports) {
    module.exports = PassZeroAPI;
}
