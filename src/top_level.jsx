// @flow

import * as React from "react";
import { pzAPI } from "./pz_api";
import LoginForm from "./login_form";
import Search from "./search";
import Entry from "./entry";
import type { T_LoginForm, T_EncEntry, T_DecEntry } from "./types";
import DeleteView from "./delete_view";

const PassZeroDomain = "https://passzero.herokuapp.com";

const Console = console;

// extension development types & polyfill
declare var chrome: any;
declare var browser: any;

var Cookies = {};

/**
 * Returns a promise
 */
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

/**
 * Returns a promise
 */
function setActiveTabAPI() {
	if(typeof(browser) !== "undefined") {
		return browser.runtime.getBrowserInfo()
			.then((info) => {
				if(info.vendor === "Mozilla") {
					Console.log("This is a Firefox extension. Active tab code doesn't work on Firefox yet.");
					return Promise.resolve(false);
				} else {
					Console.error("Unknown browser vendor: " + info.vendor);
					Console.log(info);
					return Promise.resolve(false);
				}
			});
	} else if(typeof(chrome) !== "undefined") {
		return new Promise((resolve) => {
			Console.log("This is a Chrome extension. Using the active tab API");
			resolve(true);
		});
	} else {
		return new Promise((resolve, reject) => {
			// something weird
			Console.error("failed to query what kind of browser this is so not using active tab API");
			reject();
		});
	}
}

type T_Entry = T_DecEntry | T_EncEntry;

type IProps = {};

type IState = {
	loggedIn: boolean,
	selectedEntry: ?number,
	entries: Array<T_Entry>,
	email: string,
	password: string,
	deleteFlag: boolean,
	loginErrorMsg: ?string,
	hasActiveTab: boolean,
	currentUrl: string
};

/**
 * Top-level component
 * Manages overall state of app
 */
class PassZero extends React.Component<IProps, IState> {
	_onLogin: Function;
	_getEntries: Function;
	_onLogout: Function;

	handleLoginSubmit: (form: T_LoginForm) => void;
	handleEntryBack: () => void;
	handleEntryClick: (entryId: number, index: number) => void;
	handleEmailChange: (event: SyntheticEvent<HTMLElement>) => void;
	handleDeleteBack: () => void;
	handleDeleteClick: () => void;
	handleLock: () => void;
	handleConfirmDelete: () => void;
	handleDecryptEntry: (decEntry: T_DecEntry, index: number) => void;

	getEntryById: Function;
	getCurrentTabUrl: Function;

	api: pzAPI;

	constructor() {
		super();
		this.state = {
			loggedIn: false,
			selectedEntry: null,
			entries: [],
			email: "",
			// need to remember this in memory because used for decryption APIs
			password: "",
			deleteFlag: false,
			loginErrorMsg: null,
			// this is set in componentWillUpdate
			hasActiveTab: false,
			// this is set in _onLogin
			currentUrl: "",
		};

		// no need to keep this in state since it doesn't affect the GUI
		this.api = new pzAPI(PassZeroDomain);

		this.getCurrentTabUrl = this.getCurrentTabUrl.bind(this);

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
		this.handleDecryptEntry = this.handleDecryptEntry.bind(this);

		this.getEntryById = this.getEntryById.bind(this);
	}

	/**
	 * Get the URL of the current tab if possible
	 * Encapsulate the various browser APIs in a promise
	 * Return a promise
	 */
	getCurrentTabUrl(): Promise<void> {
		if(this.state.hasActiveTab) {
			return new Promise((resolve) => {
				// TODO using chrome-specific APIs for now
				chrome.windows.getCurrent((window) => {
					const query = {
						active: true,
						windowId: window.id,
					};
					chrome.tabs.query(query, (tabs) => {
						const currentTab = tabs[0];
						// populate the search with the current URL
						Console.log("Current URL = " + currentTab.url);
						this.setState({
							currentUrl: currentTab.url,
						}, () => {
							// promise is resolved when currentUrl set in state
							resolve();
						});
					});
				});
			});
		} else {
			// promise resolved immediately
			return Promise.resolve();
		}
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
		}, () => {
			Console.log("Email cookie is set (successful login)");
			this.getCurrentTabUrl().then(() => {
				this._getEntries();
			});
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
				Console.log("# entries = " + entries.length);
				this.setState({
					entries: entries
				});
			})
			.catch((response) => {
				Console.log("Failed to get entries");
				if (response.status === 403 || 
					response.statusMessage === "UNAUTHORIZED" ||
					response.statusMessage === "NO_TOKEN") {
					Console.log("Getting entries failed. Setting state to logged out.");
					// all the invalidation logic is handled in componentWillUpdate
					this.setState({
						loggedIn: false,
					});
				} else {
					// not sure what happened here.
					// Usually some kind of internal server error
					if (response.body) {
						response.text().then((text) => {
							Console.log("response body text:");
							Console.log(text);
						});
					}
					Console.error(response);
					// still should log out
					this.setState({
						loggedIn: false,
					});
				}
			});
	}

	/**
	 * Called when logout state has been set.
	 *
	 * Will also be called when the login/API token information is stale
	 *
	 * It is already the case that:
	 *      1. We are logged out with respect to the server
	 *      2. state says we are logged out
	 */
	_onLogout() {
		Console.log("Logged out");
		// delete the apiToken
		const apiTokenCookieProps = {
			url: PassZeroDomain,
			name: "apiToken"
		};
		Cookies.remove(apiTokenCookieProps, () => {
			Console.log("Removed apiToken cookie (logout)");
			// reset selectedEntry
			this.setState({
				selectedEntry: null
			});
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
			.then((apiToken) => {
				Console.log("Logged in!");
				// async
				this.setState({
					loggedIn: true,
					loginErrorMsg: null,
					// save the password in memory on successful login
					password: form.password,
				});
				return apiToken;
			})
			.then((apiToken) => {
				Cookies.set({
					url: PassZeroDomain,
					name: "apiToken",
					value: apiToken
				}, () => {
					Console.log("API token cookie is set (successful login)");
					// getting entries and next steps determined by componentWillUpdate
				});
			})
			.catch((response) => {
				Console.error("Failed to log in");
				let errorMsg = "";
				if (response.status === 0) {
					errorMsg = "This is meant to be run in an extension, not as a standalone site";
				} else if (response.status === 401) {
					errorMsg = "The username or password is incorrect";
				} else {
					errorMsg = "Failed to log in";
					Console.error(response);
					Console.log(arguments);
				}
				this.setState({
					loginErrorMsg: errorMsg
				});
			});
	}

	/**
	 * Patch in the decrypted entry into entries
	 */
	handleDecryptEntry(decEntry: T_DecEntry, index: number) {
		const entries = this.state.entries;
		const encEntry = entries[index];

		// copy in properties from encEntry to decEntry
		for(const k in encEntry) {
			if(!(k in decEntry) && k !== "is_encrypted") {
				Console.log(`Setting property ${k} in decEntry to ${encEntry[k]}`);
				decEntry[k] = encEntry[k];
			}
		}

		// replace encEntry with decEntry
		entries[index] = decEntry;

		// force UI update
		this.setState({ entries: entries });
	}

	handleEntryClick(entryID: number, index: number) {
		Console.log("Selected entry: " + entryID);
		this.setState({
			selectedEntry: entryID
		});
		// and initiate entry decryption
		this.api.getEntry(entryID, this.state.password)
			.then(entry => this.handleDecryptEntry(entry, index));
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
				{ this.state.loggedIn ?
					<Search entries={ this.state.entries }
						onEntryClick={ this.handleEntryClick }
						currentUrl={ this.state.currentUrl }
						hide={ this.state.selectedEntry !== null } /> :
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
	 * Only called once.
	 */
	componentWillMount() {
		// figure out if we have an active tab API
		setActiveTabAPI().then((hasActiveTab: boolean) => {
			Console.log("hasActiveTab? " + hasActiveTab.toString());
			return this.setState({
				"hasActiveTab": hasActiveTab,
			});
		}).then(() => {
			// figure out which cookie API is enabled
			return setCookiesAPI();
		}).then(() => {
				
			// Cookies API is set asynchronously
			const apiTokenCookieProps = {
				url: PassZeroDomain,
				name: "apiToken"
			};
			const emailCookieProps = {
				url: PassZeroDomain,
				name: "email"
			};
			Cookies.get(emailCookieProps, (cookie) => {
				if (cookie && cookie.value) {
					Console.log("Found saved email cookie.");
					this.setState({ email: cookie.value });
				} else {
					// get rid of null cookie
					Cookies.remove(emailCookieProps);
				}
			});
			Cookies.get(apiTokenCookieProps, (cookie) => {
				if (cookie && cookie.value) {
					Console.log("Found saved API token, trying to use that to log in...");
					this.api.setToken(cookie.value);
					this.setState({ loggedIn: true });
				}
			});
		});
	}
}

export default PassZero;
