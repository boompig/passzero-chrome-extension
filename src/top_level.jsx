// @flow

import * as React from "react";
//import PassZeroAPI from "./passzero_api";
import { pzAPI } from "./pz_api";
import LoginForm from "./login_form";
import Search from "./search";
import Entry from "./entry";
import DeleteView from "./delete_view";

const PassZeroDomain = "https://passzero.herokuapp.com";

const Console = console;

// extension development types & polyfill
declare var chrome: any;
declare var browser: any;

var Cookies = {};

function setCookiesAPI() {
	if(typeof(browser) !== "undefined") {
		return browser.runtime.getBrowserInfo()
			.then((info) => {
				if(info.vendor === "Mozilla") {
					Console.log("This is a Firefox extension. Using the Firefox cookies API.");
					Cookies = browser.cookies;
				} else {
					Console.error("Unknown browser vendor: " + info.vendor);
					Console.log(info);
				}
			});
	} else if(typeof(chrome) !== "undefined") {
		return new Promise((resolve) => {
			Console.log("This is a Chrome extension. Using the Chrome cookies API.");
			Cookies = chrome.cookies;
			resolve();
		});
	} else {
		return new Promise((resolve, reject) => {
			// something weird
			Console.error("No access to cookies interface");
			reject();
		});
	}
}

type T_LoginForm = {
	email: string,
	password: string
};

type T_Entry = any;

type IProps = {};

type IState = {
	loggedIn: boolean,
	selectedEntry: ?number,
	entries: Array<T_Entry>,
	email: string,
	deleteFlag: boolean,
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

	api: pzAPI;

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

		// no need to keep this in state since it doesn't affect the GUI
		this.api = new pzAPI();

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
		Cookies.set({
			url: PassZeroDomain,
			name: "email",
			value: this.state.email
		}, (cookie) => {
			Console.log("Email cookie is set:");
			Console.log(cookie);
			this._getEntries();
		});
	}

	/**
	 * Retrieve entries from the server
	 */
	_getEntries() {
		// get entries
		Console.log("Loading entries...");
		this.api.getEntries()
			.then((entries) => {
				Console.log("Loaded entries");
				Console.log(entries);
				this.setState({
					entries: entries
				});
			})
			.catch((response) => {
				Console.log("Failed to get entries");
				if (response.statusMessage === "UNAUTHORIZED") {
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
		Cookies.remove(obj, (details) => {
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
		this.api.login(this.state.email, form.password)
			.then(() => {
				Console.log("Logged in!");
				this.setState({
					loggedIn: true
				});
			}).catch((response) => {
				Console.error("Failed to log in");
				let errorMsg = "";
				if (response.statusCode === 0) {
					errorMsg = "This is meant to be run in an extension, not as a standalone site";
				} else if (response.statusCode === 401) {
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
		this.api.logout().then(() => {
			this.setState({ loggedIn: false });
		});
	}

	handleEmailChange(event: SyntheticEvent<HTMLElement>) {
		if(event.target instanceof window.HTMLInputElement) {
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
		const selectedEntry = this.state.selectedEntry;
		if(selectedEntry !== null && selectedEntry !== undefined) {
			Console.log("Deleting entry with ID " + selectedEntry);
			this.api.deleteEntry(selectedEntry)
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

	/**
	 * Called after the constructor
	 */
	componentWillMount() {
		setCookiesAPI().then(() => {
			// Cookies API is set asynchronously
			const obj = {
				url: PassZeroDomain,
				name: "session"
			};
			const emailCookieProps = {
				url: PassZeroDomain,
				name: "email"
			};
			Cookies.get(emailCookieProps, (cookie) => {
				Console.log("email cookie:");
				Console.log(cookie);
				if (cookie) {
					this.setState({ email: cookie.value });
				} else {
					// get rid of null cookie
					Cookies.remove(emailCookieProps);
				}
			});
			Cookies.get(obj, (cookie) => {
				if (cookie && cookie.value) {
					Console.log("logged in (due to session cookie)!");
					this.setState({ loggedIn: true });
				}
			});
		});
	}
}

export default PassZero;
