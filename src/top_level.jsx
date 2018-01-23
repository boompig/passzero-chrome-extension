// @flow

import * as React from "react";
import PassZeroAPI from "./passzero_api.js";
import LoginForm from "./login_form.jsx";
import Search from "./search.jsx";
import Entry from "./entry.jsx";
import DeleteView from "./delete_view.jsx";

const PassZeroDomain = "https://passzero.herokuapp.com";

let Console = console;

declare var chrome: any;

type T_LoginForm = {
	email: string,
	password: string
};

type T_Entry = any;

type IProps = {};

type IState = {
	loggedIn: bool,
	selectedEntry: ?T_Entry,
	entries: Array<T_Entry>,
	email: string,
	deleteFlag: bool,
	loginErrorMsg: ?string
};

/**
 * Top-level component
 * Manages overall state of app
 */
class PassZero extends React.Component<IProps, IState> {
	_onLogin: Function;
	_getEntries: Function;
	_onLogout: Function;

	handleLoginSubmit: Function;
	handleEntryBack: Function;
	handleEntryClick: Function;
	handleEmailChange: Function;
	handleDeleteBack: Function;
	handleDeleteClick: Function;
	handleLock: Function;
	handleConfirmDelete: Function;

	getEntryById: Function;

	constructor() {
		super();
		this.state = {
			loggedIn: false,
			selectedEntry: null,
			entries: [],
			email: "",
			deleteFlag: false,
			loginErrorMsg: null
		};

		this._onLogin = this._onLogin.bind(this);
		this._getEntries = this._getEntries.bind(this);
		this._onLogout = this._onLogout.bind(this);

		this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
		this.handleEntryBack = this.handleEntryBack.bind(this);
		this.handleEntryClick = this.handleEntryClick.bind(this);
		this.handleEmailChange = this.handleEmailChange.bind(this);
		this.handleDeleteBack = this.handleDeleteBack.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handleLock = this.handleLock.bind(this);
		this.handleConfirmDelete = this.handleConfirmDelete.bind(this);

		this.getEntryById = this.getEntryById.bind(this);
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
		}, (cookie) => {
			Console.log("Email cookie is set:");
			Console.log(cookie);
		});
		this._getEntries();
	}

	/**
	 * Retrieve entries from the server
	 */
	_getEntries() {
		// get entries
		Console.log("Loading entries...");
		PassZeroAPI.getEntries()
			.then((entries) => {
				Console.log("Loaded entries");
				Console.log(entries);
				this.setState({
					entries: entries
				});
			})
			.fail((response, textStatus, errorText) => {
				Console.log("Failed to get entries");
				if (errorText === "UNAUTHORIZED") {
					this.setState({
						loggedIn: false
					});
				}
			});
	}

	/**
	 * Called when logout state has been set.
	 * It is already the case that:
	 *      1. We are logged out with respect to the server
	 *      2. state says we are logged out
	 */
	_onLogout() {
		Console.log("Logged out");
		this.setState({
			selectedEntry: null
		});
		// current session is not correct
		// delete the session
		const obj = {
			url: PassZeroDomain,
			name: "session"
		};
		chrome.cookies.remove(obj, (details) => {
			Console.log("remove session cookie response:");
			Console.log(details);
		});
	}

	componentWillUpdate(nextProps: IProps, nextState: IState) {
		if (!this.state.loggedIn && nextState.loggedIn) {
			this._onLogin();
		} else if (this.state.loggedIn && !nextState.loggedIn) {
			this._onLogout();
		}
	}

	handleLoginSubmit(form: T_LoginForm) {
		PassZeroAPI.validateLogin(this.state.email, form.password)
			.done(() => {
				Console.log("Logged in!");
				this.setState({
					loggedIn: true
				});
			}).fail((response) => {
				let errorMsg = "";
				if (response.status === 0) {
					errorMsg = "This is meant to be run in an extension, not as a standalone site";
				} else if (response.status === 401) {
					errorMsg = "The username or password is incorrect";
				} else {
					errorMsg = "Failed to log in";
				}
				Console.log(arguments);
				this.setState({
					"loginErrorMsg": errorMsg
				});
			});
	}

	handleEntryClick(entryID: number) {
		Console.log("Selected entry: " + entryID);
		this.setState({
			selectedEntry: entryID
		});
	}

	getEntryById(entryID: number) {
		for (let i = 0; i < this.state.entries.length; i++) {
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
		// also hit the logout API
		PassZeroAPI.logout().then(() => {
			this.setState({ loggedIn: false });
		});
	}

	handleEmailChange(event: SyntheticEvent<HTMLElement>) {
		if(event instanceof window.HTMLInputElement) {
			this.setState({
				email: event.target.value
			});
		}
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
		if(this.state.selectedEntry) {
			Console.log("Deleting entry with ID " + this.state.selectedEntry);
			PassZeroAPI.deleteEntry(this.state.selectedEntry)
				.then((response) => {
					Console.log("Deleted");
					Console.log(response);

					// deselect entry and unset the flag
					this.setState({
						deleteFlag: false,
						selectedEntry: null
					});
					this._getEntries();
				});
		} else {
			Console.error("No entry selected");
		}
	}

	render() {
		return (
			<div>
				{ this.state.loggedIn ? null :
					<LoginForm
						onLoginSubmit={ this.handleLoginSubmit }
						email={ this.state.email }
						onEmailChange={ this.handleEmailChange }
						errorMsg={ this.state.loginErrorMsg } 
					/> }
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
		const obj = {
			url: PassZeroDomain,
			name: "session"
		};
		const emailCookieProps = {
			url: PassZeroDomain,
			name: "email"
		};
		if(typeof(chrome) === "undefined") {
			Console.error("No access to Chrome extension API");
		} else {
			chrome.cookies.get(emailCookieProps, (cookie) => {
				Console.log("email cookie:");
				Console.log(cookie);
				if (cookie) {
					this.setState({ email: cookie.value });
				}
			});
			chrome.cookies.get(obj, (cookie) => {
				if (cookie && cookie.value) {
					Console.log("logged in!");
					this.setState({ loggedIn: true });
				}
			});
		}
	}
}

export default PassZero;
