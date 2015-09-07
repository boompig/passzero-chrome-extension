/**
 * Requires JQuery
 */
var PassZeroAPI = {
    apiBaseURL: "https://passzero.herokuapp.com/api",

    /**
     * Authenticate given user using PassZero API. Return a promise.
     */
    validateLogin: function (email, password) {
        var data = { email: email, password: password };
        return $.ajax({
            url: PassZeroAPI.apiBaseURL + "/login",
            data: data,
            dataType: "json",
            method: "POST"
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
    }
};
