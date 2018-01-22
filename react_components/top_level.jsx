/* global chrome */

import React from "react";
import PassZeroAPI from "./passzero_api.js";
import LoginForm from "./login_form.jsx";
import Search from "./search.jsx";
import Entry from "./entry.jsx";
import DeleteView from "./delete_view.jsx";

const PassZeroDomain = "https://passzero.herokuapp.com";

let Console = console;

/**
 * Top-level component
 * Manages overall state of app
 */
class PassZero extends React.Component {
	constructor() {
		super();
		this.state = {
			loggedIn: false,
			selectedEntry: null,
			entries: [],
			email: null,
			deleteFlag: false
		};
	}

	/**
	 * Called on successful loggin
	 * loggedIn = true already set
	 * Loads entries
	 */
	_onLogin() {
		// save state email in a cookie
		Console.log("Setting email cookie: " + this.state.email);
		chrome.cookies.set({
			url: PassZeroDomain,
			name: "email",
			value: this.state.email
		}, function (cookie) {
			Console.log("Email cookie is set:");
			Console.log(cookie);
		});
		this._getEntries();
	}

	/**
	 * Retrieve entries from the server
	 */
	_getEntries() {
		var that = this;
		// get entries
		Console.log("Loading entries...");
		PassZeroAPI.getEntries()
			.success(function (entries) {
				Console.log("Loaded entries");
				Console.log(entries);
				that.setState({
					entries: entries
				});
			})
			.error(function (response, textStatus, errorText) {
				Console.log("Failed to get entries");
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
	 *	  2. state says we are logged out
	 */
	_onLogout() {
		Console.log("Logged out");
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
			Console.log("remove session cookie response:");
			Console.log(details);
		});
	}

	componentWillUpdate(nextProps, nextState) {
		if (!this.state.loggedIn && nextState.loggedIn) {
			this._onLogin();
		} else if (this.state.loggedIn && !nextState.loggedIn) {
			this._onLogout();
		}
	}

	handleLoginSubmit(form) {
		var that = this;
		PassZeroAPI.validateLogin(this.state.email, form.password)
			.success(function() {
				Console.log("Logged in!");
				that.setState({
					loggedIn: true
				});
			}).error(function(response) {
				var errorMsg;
				if (response.status === 0) {
					errorMsg = "This is meant to be run in an extension, not as a standalone site";
				} else if (response.status === 401) {
					errorMsg = "The username or password is incorrect";
				} else {
					errorMsg = "Failed to log in";
				}
				Console.log(arguments);
				that.refs.loginForm.setState({
					errorMsg: errorMsg
				});
			});
	}

	handleEntryClick(entryID) {
		Console.log("Selected entry: " + entryID);
		this.setState({
			selectedEntry: entryID
		});
	}

	getEntryById(entryID) {
		for (var i = 0; i < this.state.entries.length; i++) {
			if (this.state.entries[i].id === entryID) {
				return this.state.entries[i];
			}
		}
		return null;
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

	handleDeleteClick() {
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
		Console.log("Deleting entry with ID " + this.state.selectedEntry);
		PassZeroAPI.deleteEntry(this.state.selectedEntry)
			.then(function (response) {
				Console.log("Deleted");
				Console.log(response);

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
				{ this.state.loggedIn ? null :
					<LoginForm
						onLoginSubmit={ this.handleLoginSubmit }
						email={ this.state.email }
						onEmailChange={ this.handleEmailChange } /> }
				{ this.state.loggedIn && !this.state.selectedEntry ?
					<Search entries={ this.state.entries }
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
		chrome.cookies.get(emailCookieProps, function (cookie) {
			Console.log("email cookie:");
			Console.log(cookie);
			if (cookie) {
				that.setState({ email: cookie.value });
			}
		});
		chrome.cookies.get(obj, function (cookie) {
			if (cookie && cookie.value) {
				Console.log("logged in!");
				that.setState({ loggedIn: true });
			}
		});
	}
}

export default PassZero;
