// @flow

class pzAPI {
	token: ?string;
	baseUrl: string;

	constructor(baseUrl: ?string) {
		this.token = null;
		if(baseUrl) {
			this.baseUrl = baseUrl;
		} else {
			this.baseUrl = "https://passzero.herokuapp.com";
		}
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

	getJSON(relativeUrl: string, token: ?string): Promise<any> {
		// TODO ignores data for now
		if(!relativeUrl) {
			return new Promise((resolve, reject) => {
				reject("relativeUrl must be specified");
			});
		}
		const headers = this.getHeaderWithToken(token);
		return window.fetch({
			url: this.baseUrl + relativeUrl,
			method: "GET",
			headers: headers,
		});
	}

	postJSON(relativeUrl: (string | any), data: ?any, token: ?string): Promise<any> {
		data = data || {};
		if(typeof(relativeUrl) !== "string") {
			let options = relativeUrl;
			relativeUrl = options.relativeUrl;
			data = options.data || {};
			token = options.token || null;
		}
		if(!relativeUrl) {
			return new Promise((resolve, reject) => {
				reject("relativeUrl must be specified");
			});
		}
		const headers = this.getHeaderWithToken(token);
		return window.fetch({
			url: this.baseUrl + relativeUrl,
			method: "POST",
			headers: headers,
			data: JSON.stringify(data)
		});
	}

	deleteJSON(relativeUrl: (string | any), data: ?any, token: ?string): Promise<any> {
		data = data || {};
		if(typeof(relativeUrl) !== "string") {
			let options = relativeUrl;
			relativeUrl = options.relativeUrl;
			data = options.data || {};
			token = options.token || null;
		}
		if(!relativeUrl) {
			return new Promise((resolve, reject) => {
				reject("relativeUrl must be specified");
			});
		}
		const headers = this.getHeaderWithToken(token);
		return window.fetch({
			url: this.baseUrl + relativeUrl,
			method: "DELETE",
			headers: headers,
			data: JSON.stringify(data)
		});
	}

	_getEntriesWithToken(): Promise<any> {
		return this.getJSON("/api/v3/entries", this.token)
			.then((response) => {
				return JSON.parse(response.body);
			});
	}

	getEntries(): Promise<any> {
		if(this.token) {
			return this._getEntriesWithToken();
		} else {
			return new Promise((resolve, reject) => {
				reject("We don't have a token yet");
			});
		}
	}

	/**
	 * Save the token
	 */
	login(email: string, password: string): Promise<any> {
		const data = { "email": email, "password": password };
		return this.postJSON("/api/v3/token", data)
			.then((response) => {
				const responseData = JSON.parse(response.body);
				this.token = responseData.token;
				return this.token;
			});
	}

	logout(): Promise<any> {
		return this.deleteJSON({ url: "/api/v3/token", token: this.token })
			.then(() => {
				this.token = null;
			});
	}

	deleteEntry(entryId: number): Promise<any> {
		return this.deleteJSON({
			relativeUrl: "/api/v3/entries/" + entryId,
			token: this.token
		});
	}

	getEntry(entryId: number, password: string): Promise<any> {
		if(!entryId) {
			return new Promise((resolve, reject) => { 
				reject("Error: entryId is required");
			});
		}
		return this.postJSON({
			relativeUrl: "/api/v3/entries/" + entryId,
			data: { "password": password },
			token: this.token
		})
			.then((response) => {
				return JSON.parse(response.body);
			});
	}

	createEntry(entry: any, password: string): Promise<any> {
		if(!entry) {
			return new Promise((resolve, reject) => {
				reject("Error: entry is required");
			});
		}
		return this.postJSON({
			relativeUrl: "/api/v3/entries",
			data: { "password": password, "entry": entry },
			token: this.token
		})
			.then((response) => {
				return JSON.parse(response.body).entry_id;
			});
	}
}

export { pzAPI };

