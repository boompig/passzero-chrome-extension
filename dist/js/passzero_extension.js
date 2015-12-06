(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";

var PassZeroAPI = require("./passzero_api.js");
var Utils = require("./passzero_utils.js");

/**
 * This file is responsible for the UI aspects of the PassZero Chrome extension
 * Each element
 */

var Entry = React.createClass({displayName: "Entry",
    handlePasswordClick: function (event) {
        Utils.selectText(event.target);
    },
    render: function () {
        return (
            React.createElement("div", {id: "entry-container"}, 
                React.createElement("span", {className: "back-button glyphicon glyphicon-chevron-left", role: "button", 
                    onClick:  this.props.onBack}), 
                React.createElement("div", {className: "entry"}, 
                    React.createElement("div", {className: "entry-account"},  this.props.entry.account), 
                    React.createElement("div", {className: "entry-username"},  this.props.entry.username), 
                    React.createElement("div", {className: "entry-password password-hidden", onClick:  this.handlePasswordClick}, 
                         this.props.entry.password
                    )
                )
            )
        );
    }
});

var SearchResultsLink = React.createClass ({displayName: "SearchResultsLink",
    handleClick: function (event) {
        event.preventDefault();
        var entryID = this.props.entry.id;
        this.props.onEntryClick(entryID);
    },
    render: function () {
        return (
            React.createElement("div", {className: "search-result-entry"}, 
                React.createElement("a", {className: "search-result-link", href: "#", 
                 onClick:  this.handleClick},  this.props.entry.account)
            )
        );
    }
});

/**
 * Container for search results.
 */
var SearchResults = React.createClass ({displayName: "SearchResults",
    render: function () {
        var searchString = this.props.searchString;
        var results = [];
        for (let i = 0; i < this.props.entries.length; i++) {
            let entry = this.props.entries[i];
            if (entry.account.toLowerCase().indexOf(searchString) >= 0) {
                results.push(
                    React.createElement(SearchResultsLink, {key:  entry.id, 
                        entry:  entry, 
                        onEntryClick:  this.props.onEntryClick})
                );
            }
        }

        return (
            React.createElement("div", {className: "searchResults"}, 
                results
            )
        );
    }
});

/**
 * Component for search
 * Includes searchresults and search string
 */
var Search = React.createClass ({displayName: "Search",
    getInitialState: function () {
        return { searchString: "" }
    },
    handleChange: function (e) {
        this.setState({ searchString: e.target.value });
    },
    render: function () {
        var searchString = this.state.searchString.trim().toLowerCase();
        return (
            React.createElement("div", {id: "search-container"}, 
                React.createElement("form", {id: "search-form", role: "search"}, 
                    React.createElement("input", {className: "form-control", type: "search", placeholder: "search", 
                        onChange:  this.handleChange, tabIndex: "1"})
                ), 
                React.createElement(SearchResults, {entries:  this.props.entries, searchString: searchString, 
                    onEntryClick:  this.props.onEntryClick})
            )
        );
    }
});

/**
 * The login widget
 * On success, need to call some sort of parent event...
 */
var LoginForm = React.createClass ({displayName: "LoginForm",
    getInitialState: function () {
        return { errorMsg: null };
    },
    handleSubmit: function (e) {
        e.preventDefault();
        var email = React.findDOMNode (this.refs.loginEmail).value;
        var password = React.findDOMNode (this.refs.loginPassword).value;
        this.props.onLoginSubmit({
            email: email,
            password: password
        });
    },
    render: function () {
        return (
            React.createElement("form", {id: "login-form", role: "form", onSubmit:  this.handleSubmit}, 
                 this.state.errorMsg ?
                    React.createElement("div", {className: "error"},  this.state.errorMsg) : null, 
                React.createElement("input", {className: "form-control", type: "email", ref: "loginEmail", placeholder: "email", 
                    required: "required", tabIndex: "1"}), 
                React.createElement("input", {className: "form-control", type: "password", ref: "loginPassword", placeholder: "password", 
                    required: "required", tabIndex: "2"}), 
                React.createElement("button", {className: "form-control btn btn-success", type: "submit"}, "Log In")
            )
        );
    }
});

/**
 * Top-level component
 * Manages overall state of app
 */
var PassZero = React.createClass ({displayName: "PassZero",
    getInitialState: function () {
        return {
            loggedIn: false,
            selectedEntry: null,
            entries: []
        };
    },
    /**
     * Called on successful loggin
     * loggedIn = true already set
     * Loads entries
     */
    _onLogin: function () {
        this._getEntries();
    },
    /**
     * Retrieve entries from the server
     */
    _getEntries: function () {
        var that = this;
        // get entries
        console.log("Loading entries...");
        PassZeroAPI.getEntries()
        .success(function (entries) {
            console.log("Loaded entries");
            console.log(entries);
            that.setState({
                entries: entries
            });
        }).error(function (response, textStatus, errorText) {
            console.log("Failed to get entries");
            if (errorText === "UNAUTHORIZED") {
                that.setState({
                    loggedIn: false
                });
            }
        });
    },
    /**
     * Called when logout state has been set.
     * It is already the case that:
     * 		1. We are logged out with respect to the server
     *      2. state says we are logged out
     */
    _onLogout: function () {
        console.log("Logged out");
        this.setState({
            selectedEntry: null
        });
        // current session is not correct
        // delete the session
        var obj = {
            url: "https://passzero.herokuapp.com",
            name: "session"
        };
        chrome.cookies.remove(obj, function (details) {
            console.log("remove session cookie response:");
            console.log(details);
        });
    },
    componentWillUpdate: function (nextProps, nextState) {
        if (!this.state.loggedIn && nextState.loggedIn) {
            this._onLogin();
        } else if (this.state.loggedIn && !nextState.loggedIn) {
            this._onLogout();
        }
    },
    handleLoginSubmit: function (form) {
        var that = this;
        PassZeroAPI.validateLogin(form.email, form.password)
        .success(function (response) {
            console.log("Logged in!");
            that.setState({
                loggedIn: true
            });
        }).error(function (response, errorText, c) {
            var errorMsg;
            if (response.status === 0) {
                errorMsg = "This is meant to be run in an extension, not as a standalone site";
            } else if (response.status === 401) {
                errorMsg = "The username or password is incorrect";
            } else {
                errorMsg = "Failed to log in";
            }
            console.log(arguments);
            that.refs.loginForm.setState({
                errorMsg: errorMsg
            });
        });
    },
    handleEntryClick: function (entryID) {
        console.log("Selected entry: " + entryID);
        this.setState({
            selectedEntry: entryID
        });
    },
    getEntryById: function (entryID) {
        for (var i = 0; i < this.state.entries.length; i++) {
            if (this.state.entries[i].id === entryID) {
                return this.state.entries[i];
            }
        }
        return null;
    },
    handleEntryBack: function () {
        this.setState({
            selectedEntry: null
        });
    },
    handleLock: function () {
        var that = this;
        // also hit the logout API
        PassZeroAPI.logout().then(function() {
            that.setState({ loggedIn: false });
        });
    },
    render: function () {
        return (
            React.createElement("div", null, 
                 this.state.loggedIn ? null :
                    React.createElement(LoginForm, {ref: "loginForm", onLoginSubmit:  this.handleLoginSubmit}), 
                 this.state.loggedIn && !this.state.selectedEntry ?
                    React.createElement(Search, {ref: "search", entries:  this.state.entries, 
                        onEntryClick:  this.handleEntryClick}) :
                            null, 
                 this.state.loggedIn && this.state.selectedEntry ?
                    React.createElement(Entry, {entry:  this.getEntryById(this.state.selectedEntry), 
                        onBack:  this.handleEntryBack}) :
                        null, 
                 this.state.loggedIn ?
                    React.createElement("div", {id: "lock-btn-container"}, 
                        React.createElement("button", {id: "lock-btn", className: "form-control btn btn-warning", 
                            onClick:  this.handleLock}, "Lock")
                    ) :
                        null
            )
        );
    },
    componentWillMount: function () {
        var obj = {
            url: "https://passzero.herokuapp.com",
            name: "session"
        };
        var that = this;
        chrome.cookies.get(obj, function (cookie) {
            if (cookie && cookie.value) {
                console.log("logged in!");
                that.setState({ loggedIn: true });
            }
        });
    }
});

React.render(
    React.createElement(PassZero, null),
    document.getElementById("passzero-app")
);

},{"./passzero_api.js":1,"./passzero_utils.js":3}],3:[function(require,module,exports){
var PassZeroUtils = {
    /**
    * From this SOF thread:
    * https://stackoverflow.com/questions/985272/selecting-text-in-an-element-ak
    in-to-highlighting-with-your-mouse
    */
    selectText: function selectText(element) {
        "use strict";
        var doc = document;
        var text = element;
        var range, selection;
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    },
    deselectText: function deselectText () {
        var doc = document, range, selection;
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();
            selection.removeAllRanges();
        }
    }
};

if (module && module.exports) {
    module.exports = PassZeroUtils;
}

},{}]},{},[1,3,2]);
