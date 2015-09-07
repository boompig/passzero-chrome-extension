"use strict";

var entries = [
    {
        account: "gmail",
        username: "dbkats@gmail.com",
        password: "foo",
        id: 10
    },
    {
        account: "facebook",
        username: "dbkats@fb.me",
        password: "foo",
        id: 57
    },
    {
        account: "twitter",
        username: "boompig",
        password: "foo",
        id: 31
    },
];

var Entry = React.createClass({
    render: function () {
        return (
            <div className="entry-container">
                <button className="back-button"
                    onClick={ this.props.onBack }>Back</button>
                <div className="entry">
                    <div className="entry-account">{ this.props.entry.account }</div>
                    <div className="entry-username">{ this.props.entry.username }</div>
                    <div className="entry-password">{ this.props.entry.password }</div>
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
            <div className="search">
                <input type="search" placeholder="search" onChange={ this.handleChange } />
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
            <form onSubmit={ this.handleSubmit }>
                <input type="email" ref="loginEmail" placeholder="email"
                    required="required" tabIndex="1" />
                <input type="password" ref="loginPassword" placeholder="password"
                    required="required" tabIndex="2" />
                <button type="submit">Log In</button>
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
            selectedEntry: null
        };
    },
    handleLoginSubmit: function (form) {
        // TODO use remote login here
        var correctEmail = "dbkats@gmail.com";
        var correctPassword = "floof";
        if (correctEmail === form.email && correctPassword === form.password) {
            this.setState({ loggedIn: true });
        }
    },
    handleEntryClick: function (entryID) {
        this.setState({
            selectedEntry: entryID
        });
    },
    getEntryById: function (entryID) {
        for (var i = 0; i < this.props.entries.length; i++) {
            if (this.props.entries[i].id === entryID) {
                return this.props.entries[i];
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
                    <LoginForm onLoginSubmit={ this.handleLoginSubmit } /> }
                { this.state.loggedIn && !this.state.selectedEntry ?
                    <Search entries={ this.props.entries }
                        onEntryClick={ this.handleEntryClick } /> :
                            null }
                { this.state.loggedIn && this.state.selectedEntry ? 
                    <Entry entry={ this.getEntryById(this.state.selectedEntry) }
                        onBack={ this.handleEntryBack } /> :
                        null }
                { this.state.loggedIn ?
                    <button id="lock-btn" onClick={ this.handleLock }>Lock</button> :
                        null }
            </div>
        );
    },
});

React.render(
    <PassZero entries={ entries } />,
    document.getElementById("passzero-app")
);
