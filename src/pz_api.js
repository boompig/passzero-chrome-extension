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
		}).then(response => response.json());
	}

	/**
	 * Return the parsed response body
	 */
	postJSON(relativeUrl: string, options?: T_postOptions): Promise<any> {
		options = options || {};
		let data = options.data || {};
		let token = options.token || null;
		if(!relativeUrl) {
			return this._rejectNoParam("relativeUrl");
		}
		const url = this.baseUrl + relativeUrl;
		const headers = this.getHeaderWithToken(token);
		return window.fetch(url, {
			method: "POST",
			headers: headers,
			body: JSON.stringify(data)
		}).then(response => response.json());
	}

	/**
	 * Return the parsed response body
	 */
	deleteJSON(relativeUrl: string, options?: T_postOptions): Promise<any> {
		options = options || {};
		let data = options.data || {};
		let token = options.token || null;
		if(!relativeUrl) {
			return this._rejectNoParam("relativeUrl");
		}
		const headers = this.getHeaderWithToken(token);
		const url = this.baseUrl + relativeUrl;
		return window.fetch(url, {
			method: "DELETE",
			headers: headers,
			body: JSON.stringify(data)
		}).then(response => response.json());
	}

	_getEntriesWithToken(): Promise<any> {
		if(!this.token) {
			return this._rejectNoToken();
		}
		return this.getJSON("/api/v3/entries", this.token);
	}

	_rejectNoToken(): Promise<any> {
		return new Promise((resolve, reject) => {
			reject({
				"errorText": "We don't have a token yet",
				// to be in line with previous code
				"statusMessage": "NO_TOKEN"
			});
		});
	}

	_rejectNoParam(param: string): Promise<any> {
		return new Promise((resolve, reject) => {
			reject({
				"errorText": "Parameter " + param + " is required",
				"statusMessage": "MISSING_REQUIRED_PARAM"
			});
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
	 * Save the token
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
			.then(() => {
				this.token = null;
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

