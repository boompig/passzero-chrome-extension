"use strict";

const PassZeroAPI = require("./passzero_api.js");
const PassZeroDomain = "https://passzero.herokuapp.com";
const ReactDOM = require("react-dom");
const React = require("react");

const LoginForm = require("./login_form.jsx").LoginForm;
const DeleteView = require("./delete_view.jsx").DeleteView;
const Entry = require("./entry.jsx").Entry;
const Search = require("./search.jsx").Search;

/**
 * Top-level component
 * Manages overall state of app
 */
class PassZero extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            selectedEntry: null,
            entries: [],
            email: "",
            deleteFlag: false
        };
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleLoginSuccess = this.handleLoginSuccess.bind(this);
        this.handleEntryClick = this.handleEntryClick.bind(this);
        this._onLogin = this._onLogin.bind(this);
        this._getEntries = this._getEntries.bind(this);
        this._onLogout = this._onLogout.bind(this);
        this.handleEntryBack = this.handleEntryBack.bind(this);
        this.handleLock = this.handleLock.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleDeleteBack = this.handleDeleteBack.bind(this);
        this.handleConfirmDelete = this.handleConfirmDelete.bind(this);
    }

    /**
     * Called on successful loggin
     * loggedIn = true already set
     * Loads entries
     */
    _onLogin() {
        // save state email in a cookie
        console.log("Setting email cookie: " + this.state.email);
        chrome.cookies.set({
            url: PassZeroDomain,
            name: "email",
            value: this.state.email
        }, function(cookie) {
            console.log("Email cookie is set:");
            console.log(cookie);
        });
        this._getEntries();
    }

    /**
     * Retrieve entries from the server
     */
    _getEntries() {
        var that = this;
        // get entries
        console.log("Loading entries...");
        PassZeroAPI.getEntriesv2()
        .success(function(entries) {
            console.log("Loaded entries");
            console.log(entries);
            that.setState({
                entries: entries
            });
        }).error(function(response, textStatus, errorText) {
            console.log("Failed to get entries");
            if (errorText === "UNAUTHORIZED") {
                that.setState({
                    loggedIn: false
                });
            }
        });
    }

    /**
     * Called when logout state has been set.
     * It is already the case that:
     * 		1. We are logged out with respect to the server
     *      2. state says we are logged out
     */
    _onLogout() {
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
        chrome.cookies.remove(obj, function(details) {
            console.log("remove session cookie response:");
            console.log(details);
        });
    }

    componentWillUpdate(nextProps, nextState) {
        if (!this.state.loggedIn && nextState.loggedIn) {
            this._onLogin();
        } else if (this.state.loggedIn && !nextState.loggedIn) {
            this._onLogout();
        }
    }

    handleLoginSuccess(email, password) {
        this.setState({
            loggedIn: true
        });
    }

    handleEntryClick(entryID) {
        console.log("Selected entry: " + entryID);
        PassZeroAPI.getEntryv2(entryID).then((decEntry) => {
            console.log("Loaded entry:");
            console.log(decEntry);
            this.setState({
                selectedEntry: decEntry
            });
        });
    }

    handleEntryBack() {
        this.setState({
            selectedEntry: null
        });
    }

    handleLock() {
        var that = this;
        // also hit the logout API
        PassZeroAPI.logout().then(function() {
            that.setState({ loggedIn: false });
        });
    }

    handleEmailChange(event) {
        this.setState({
            email: event.target.value
        });
    }

    handleDeleteClick(event) {
        this.setState({
            deleteFlag: true
        });
    }

    handleDeleteBack() {
        this.setState({
            deleteFlag: false
        });
    }

    handleConfirmDelete() {
        var that = this;
        console.log("Deleting entry with ID " + this.state.selectedEntry);
        PassZeroAPI.deleteEntry(this.state.selectedEntry)
            .then(function(response) {
                console.log("Deleted");
                console.log(response);

                // deselect entry and unset the flag
                that.setState({
                    deleteFlag: false,
                    selectedEntry: null
                });
                that._getEntries();
            });
    }

    render() {
        return (
            <div>
                { this.state.loggedIn
                    ? null
                    : <LoginForm ref="loginForm"
                        onLoginSuccess={ this.handleLoginSuccess }
                        email={ this.state.email }
                        onEmailChange={ this.handleEmailChange } /> }
                { this.state.loggedIn && !this.state.selectedEntry
                    ? <Search ref="search" entries={ this.state.entries }
                        onEntryClick={ this.handleEntryClick } />
                    : null }
                { this.state.loggedIn && !this.state.deleteFlag && this.state.selectedEntry
                    ? <Entry entry={ this.state.selectedEntry }
                        onBack={ this.handleEntryBack }
                        onDeleteClick={ this.handleDeleteClick } />
                    : null }
                { this.state.loggedIn && this.state.deleteFlag && this.state.selectedEntry
                    ? <DeleteView
                        entry={ this.state.selectedEntry }
                        onBack={ this.handleDeleteBack }
                        onDeleteClick={ this.handleConfirmDelete } />
                    : null}
                { this.state.loggedIn && !this.state.deleteFlag
                    ? <div id="lock-btn-container">
                        <button id="lock-btn" className="form-control btn btn-warning"
                            onClick={ this.handleLock }>Lock</button>
                    </div>
                    : null }
            </div>
        );
    }

    componentWillMount() {
        var obj = {
            url: PassZeroDomain,
            name: "session"
        };
        var that = this;
        var emailCookieProps = {
            url: PassZeroDomain,
            name: "email"
        };
        if (chrome && chrome.cookies) {
            chrome.cookies.get(emailCookieProps, function(cookie) {
                console.log("email cookie:");
                console.log(cookie);
                if (cookie) {
                    that.setState({ email: cookie.value });
                }
            });
            chrome.cookies.get(obj, function(cookie) {
                if (cookie && cookie.value) {
                    console.log("logged in!");
                    that.setState({ loggedIn: true });
                }
            });
        }
    }
};

ReactDOM.render(
    <PassZero />,
    document.getElementById("passzero-app")
);
