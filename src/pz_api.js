// @flow

type T_postOptions = {
	token?: string,
	data?: any,
};

class pzAPI {
	token: ?string;
	baseUrl: string;

	login: Function;
	logout: Function;
	getEntries: Function;
	_getEntriesWithToken: Function;
	createEntry: Function;
	deleteEntry: Function;
	getEntry: Function;
	setToken: Function;

	constructor(baseUrl: ?string) {
		this.token = null;
		if(baseUrl) {
			this.baseUrl = baseUrl;
		} else {
			this.baseUrl = "https://passzero.herokuapp.com";
		}

		this.login = this.login.bind(this);
		this.logout = this.logout.bind(this);
		this.getEntries = this.getEntries.bind(this);
		this._getEntriesWithToken = this._getEntriesWithToken.bind(this);
		this.getEntry = this.getEntry.bind(this);
		this.createEntry = this.createEntry.bind(this);
		this.deleteEntry = this.deleteEntry.bind(this);
		this.setToken = this.setToken.bind(this);
	}

	getHeaderWithToken(token: ?string) {
		const headers = {
			"content-type": "application/json",
		};
		if(token) {
			(headers: any).Authorization = "Bearer " + token;
		}
		return headers;
	}

	/**
	 * Set the API token (if available from a previous session)
	 */
	setToken(token: string) {
		this.token = token;
	}

	/**
	 * Return the parsed response body
	 */
	getJSON(relativeUrl: string, token?: string): Promise<any> {
		// TODO ignores data for now
		if(!relativeUrl) {
			return this._rejectNoParam("relativeUrl");
		}
		const url = this.baseUrl + relativeUrl;
		const headers = this.getHeaderWithToken(token);
		return window.fetch(url, {
			method: "GET",
			headers: headers,
			credentials: "omit",
		}).then((response) => {
			if(response.ok) {
				return response.json();
			} else {
				return Promise.reject(response);
			}
		});
	}

	/**
	 * Return the parsed response body
	 */
	postJSON(relativeUrl: string, options?: T_postOptions): Promise<any> {
		options = options || {};
		const data = options.data || {};
		const token = options.token || null;
		if(!relativeUrl) {
			return this._rejectNoParam("relativeUrl");
		}
		const url = this.baseUrl + relativeUrl;
		const headers = this.getHeaderWithToken(token);
		return window.fetch(url, {
			method: "POST",
			headers: headers,
			credentials: "omit",
			body: JSON.stringify(data)
		}).then((response) => {
			if(response.ok) {
				return response.json();
			} else {
				return Promise.reject(response);
			}
		});
	}

	/**
	 * Return the parsed response body
	 */
	deleteJSON(relativeUrl: string, options?: T_postOptions): Promise<any> {
		options = options || {};
		const data = options.data || {};
		const token = options.token || null;
		if(!relativeUrl) {
			return this._rejectNoParam("relativeUrl");
		}
		const headers = this.getHeaderWithToken(token);
		const url = this.baseUrl + relativeUrl;
		return window.fetch(url, {
			method: "DELETE",
			headers: headers,
			credentials: "omit",
			body: JSON.stringify(data)
		}).then(response => {
			if(response.ok) {
				return response.json();
			} else {
				return Promise.reject(response);
			}
		});
	}

	_getEntriesWithToken(): Promise<any> {
		if(!this.token) {
			return this._rejectNoToken();
		}
		return this.getJSON("/api/v3/entries", this.token);
	}

	_rejectNoToken(): Promise<any> {
		return Promise.reject({
			"errorText": "We don't have a token yet",
			// to be in line with previous code
			"statusMessage": "NO_TOKEN"
		});
	}

	_rejectNoParam(param: string): Promise<any> {
		return Promise.reject({
			"errorText": "Parameter " + param + " is required",
			"statusMessage": "MISSING_REQUIRED_PARAM"
		});
	}

	/**
	 * Return array of encrypted entries on success
	 */
	getEntries(): Promise<any> {
		if(this.token) {
			return this._getEntriesWithToken();
		} else {
			return this._rejectNoToken();
		}
	}

	/**
	 * Login (get a new API token)
	 *
	 * This method will reset the API token if the current token is invalid
	 * On successful login, save the new token in memory
	 */
	login(email: string, password: string): Promise<any> {
		const data = { "email": email, "password": password };
		return this.postJSON("/api/v3/token", { "data": data })
			.then((responseData) => {
				this.token = responseData.token;
				return this.token;
			});
	}

	logout(): Promise<any> {
		if(!this.token) {
			return this._rejectNoToken();
		}
		const options = { "token": this.token };
		return this.deleteJSON("/api/v3/token", options)
			.then((response) => {
				this.token = null;
				return response;
			});
	}

	deleteEntry(entryId: number): Promise<any> {
		if(!this.token) {
			return this._rejectNoToken();
		}
		const options = {
			token: this.token
		};
		return this.deleteJSON("/api/v3/entries/" + entryId, options);
	}

	getEntry(entryId: number, password: string): Promise<any> {
		if(!entryId) {
			return this._rejectNoParam("entryId");
		}
		if(!this.token) {
			return this._rejectNoToken();
		}
		const options = {
			data: { "password": password },
			token: this.token
		};
		return this.postJSON("/api/v3/entries/" + entryId, options);
	}

	/**
	 * Return the entry ID on success
	 */
	createEntry(entry: any, password: string): Promise<any> {
		if(!entry) {
			return this._rejectNoParam("entry");
		}
		if(!this.token) {
			return this._rejectNoToken();
		}
		const options = {
			data: { "password": password, "entry": entry },
			token: this.token
		};
		return this.postJSON("/api/v3/entries", options)
			.then((response) => {
				return response.entry_id;
			});
	}
}

export { pzAPI };

