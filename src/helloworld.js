"use strict";

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
                    <div className="entry-account">{ this.props.entry.account }</div>
                    <div className="entry-username">{ this.props.entry.username }</div>
                    <div className="entry-password password-hidden" onClick={ this.handlePasswordClick }>
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
            <form id="login-form" role="form" onSubmit={ this.handleSubmit }>
                { this.state.errorMsg ? 
                    <div className="error">{ this.state.errorMsg }</div> : null }
                <input className="form-control" type="email" ref="loginEmail" placeholder="email"
                    required="required" tabIndex="1" />
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
            entries: []
        };
    },
    handleLoginSubmit: function (form) {
        var that = this;
        PassZeroAPI.validateLogin(form.email, form.password)
        .success(function (response) {
            console.log("Logged in!");
            that.setState({
                loggedIn: true
            });

            // get entries
            console.log("Loading entries...");
            PassZeroAPI.getEntries()
            .success(function (entries) {
                console.log("Loaded entries");
                console.log(entries);
                that.setState({
                    entries: entries
                });
            }).error(function (response, errorText, c) {
                console.log("Failed to get entries");
            });
        }).error(function (response, errorText, c) {
            that.refs.loginForm.setState({
                errorMsg: "Failed to log in"
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
        this.setState({
            selectedEntry: null,
            loggedIn: false
        });
    },
    render: function () {
        return (
            <div>
                { this.state.loggedIn ? null :
                    <LoginForm ref="loginForm" onLoginSubmit={ this.handleLoginSubmit } /> }
                { this.state.loggedIn && !this.state.selectedEntry ?
                    <Search ref="search" entries={ this.state.entries }
                        onEntryClick={ this.handleEntryClick } /> :
                            null }
                { this.state.loggedIn && this.state.selectedEntry ? 
                    <Entry entry={ this.getEntryById(this.state.selectedEntry) }
                        onBack={ this.handleEntryBack } /> :
                        null }
                { this.state.loggedIn ?
                    <button id="lock-btn" className="form-control btn btn-warning"
                        onClick={ this.handleLock }>Lock</button> :
                        null }
            </div>
        );
    },
});

React.render(
    <PassZero />,
    document.getElementById("passzero-app")
);
