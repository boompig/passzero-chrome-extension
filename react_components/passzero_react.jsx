"use strict";

var PassZeroAPI = require("./passzero_api.js");
var Utils = require("./passzero_utils.js");
var PassZeroDomain = "https://passzero.herokuapp.com";
var React = require("react");

/**
 * This file is responsible for the UI aspects of the PassZero Chrome extension
 * Each element
 */

var DeleteView = React.createClass({
    render: function() {
        return (
            <div id="confirm-delete-container">
                <span className="back-button glyphicon glyphicon-chevron-left"
                    role="button"
                    onClick={ this.props.onBack }></span>
                <p>Delete record for account '{ this.props.entry.account }'?</p>
                <button type="button"
                    className="btn btn-danger"
                    onClick={ this.props.onDeleteClick }>Confirm Delete</button>
            </div>
        );
    }
});

var Entry = React.createClass({
    handlePasswordClick: function (event) {
        Utils.selectText(event.target);
    },
    render: function () {
        return (
            <div id="entry-container">
                <span className="back-button glyphicon glyphicon-chevron-left" role="button"
                    onClick={ this.props.onBack }></span>
                <div className="entry">
                    <div className="entry-account">
                        <span>{ this.props.entry.account }</span>
                        <span id="entry-delete-btn" role="button"
                            className="glyphicon glyphicon-remove"
                            onClick={ this.props.onDeleteClick }></span>
                    </div>
                    <div className="entry-username">{ this.props.entry.username }</div>
                    <div className="entry-password password-hidden"
                    onClick={ this.handlePasswordClick }>
                        { this.props.entry.password }
                    </div>
                </div>
            </div>
        );
    }
});

var SearchResultsLink = React.createClass ({
    handleClick: function (event) {
        event.preventDefault();
        var entryID = this.props.entry.id;
        this.props.onEntryClick(entryID);
    },
    render: function () {
        return (
            <div className="search-result-entry">
                <a className="search-result-link" href="#"
                 onClick={ this.handleClick }>{ this.props.entry.account }</a>
            </div>
        );
    }
});

/**
 * Container for search results.
 */
var SearchResults = React.createClass ({
    render: function () {
        var searchString = this.props.searchString;
        var results = [];
        for (let i = 0; i < this.props.entries.length; i++) {
            let entry = this.props.entries[i];
            if (entry.account.toLowerCase().indexOf(searchString) >= 0) {
                results.push(
                    <SearchResultsLink key={ entry.id }
                        entry={ entry }
                        onEntryClick={ this.props.onEntryClick } />
                );
            }
        }

        return (
            <div className="searchResults">
                {results}
            </div>
        );
    }
});

/**
 * Component for search
 * Includes searchresults and search string
 */
var Search = React.createClass ({
    getInitialState: function () {
        return { searchString: "" }
    },
    handleChange: function (e) {
        this.setState({ searchString: e.target.value });
    },
    render: function () {
        var searchString = this.state.searchString.trim().toLowerCase();
        return (
            <div id="search-container">
                <form id="search-form" role="search">
                    <input className="form-control" type="search" placeholder="search"
                        onChange={ this.handleChange } tabIndex="1" />
                </form>
                <SearchResults entries={ this.props.entries } searchString={searchString}
                    onEntryClick={ this.props.onEntryClick } />
            </div>
        );
    }
});

/**
 * The login widget
 * On success, need to call some sort of parent event...
 */
var LoginForm = React.createClass ({
    getInitialState: function () {
        return {
            errorMsg: null,
        };
    },
    handleSubmit: function (e) {
        e.preventDefault();
        var email = React.findDOMNode(this.refs.loginEmail).value;
        var password = React.findDOMNode(this.refs.loginPassword).value;
        this.props.onLoginSubmit({
            email: email,
            password: password
        });
    },
    render: function () {
        return (
            <form id="login-form" role="form" onSubmit={ this.handleSubmit }>
                { this.state.errorMsg ?
                    <div className="error">{ this.state.errorMsg }</div> : null }
                <input className="form-control" type="email" ref="loginEmail" placeholder="email"
                    required="required" tabIndex="1"
                    value={ this.props.email }
                    onChange={ this.props.onEmailChange } />
                <input className="form-control" type="password" ref="loginPassword" placeholder="password"
                    required="required" tabIndex="2" />
                <button className="form-control btn btn-success" type="submit">Log In</button>
            </form>
        );
    }
});

/**
 * Top-level component
 * Manages overall state of app
 */
var PassZero = React.createClass ({
    getInitialState: function () {
        return {
            loggedIn: false,
            selectedEntry: null,
            entries: [],
            email: null,
            deleteFlag: false
        };
    },
    /**
     * Called on successful loggin
     * loggedIn = true already set
     * Loads entries
     */
    _onLogin: function () {
        // save state email in a cookie
        console.log("Setting email cookie: " + this.state.email);
        chrome.cookies.set({
            url: PassZeroDomain,
            name: "email",
            value: this.state.email
        }, function (cookie) {
            console.log("Email cookie is set:");
            console.log(cookie);
        });
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
            url: PassZeroDomain,
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
        PassZeroAPI.validateLogin(this.state.email, form.password)
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
    handleEmailChange: function (event) {
        this.setState({
            email: event.target.value
        });
    },
    handleDeleteClick: function (event) {
        this.setState({
            deleteFlag: true
        });
    },
    handleDeleteBack: function () {
        this.setState({
            deleteFlag: false
        });
    },
    handleConfirmDelete: function() {
        var that = this;
        console.log("Deleting entry with ID " + this.state.selectedEntry);
        PassZeroAPI.deleteEntry(this.state.selectedEntry)
            .then(function (response) {
                console.log("Deleted");
                console.log(response);

                // deselect entry and unset the flag
                that.setState({
                    deleteFlag: false,
                    selectedEntry: null
                });
                that._getEntries();
            });
    },
    render: function () {
        return (
            <div>
                { this.state.loggedIn ? null :
                    <LoginForm ref="loginForm"
                    onLoginSubmit={ this.handleLoginSubmit }
                    email={ this.state.email }
                    onEmailChange={ this.handleEmailChange } /> }
                { this.state.loggedIn && !this.state.selectedEntry ?
                    <Search ref="search" entries={ this.state.entries }
                        onEntryClick={ this.handleEntryClick } /> :
                            null }
                { this.state.loggedIn && !this.state.deleteFlag && this.state.selectedEntry ?
                    <Entry entry={ this.getEntryById(this.state.selectedEntry) }
                        onBack={ this.handleEntryBack }
                        onDeleteClick={ this.handleDeleteClick } /> :
                        null }
                { this.state.loggedIn && this.state.deleteFlag && this.state.selectedEntry ?
                    <DeleteView
                        entry={ this.getEntryById(this.state.selectedEntry) }
                        onBack={ this.handleDeleteBack }
                        onDeleteClick={ this.handleConfirmDelete } />
                    : null}
                { this.state.loggedIn && !this.state.deleteFlag ?
                    <div id="lock-btn-container">
                        <button id="lock-btn" className="form-control btn btn-warning"
                            onClick={ this.handleLock }>Lock</button>
                    </div> :
                        null }
            </div>
        );
    },
    componentWillMount: function () {
        var obj = {
            url: PassZeroDomain,
            name: "session"
        };
        var that = this;
        var emailCookieProps = {
            url: PassZeroDomain,
            name: "email"
        };
        chrome.cookies.get(emailCookieProps, function (cookie) {
            console.log("email cookie:");
            console.log(cookie);
            if (cookie) {
                that.setState({ email: cookie.value });
            }
        });
        chrome.cookies.get(obj, function (cookie) {
            if (cookie && cookie.value) {
                console.log("logged in!");
                that.setState({ loggedIn: true });
            }
        });
    }
});

React.render(
    <PassZero />,
    document.getElementById("passzero-app")
);
