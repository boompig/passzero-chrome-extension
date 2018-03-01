import { pzAPI } from "../src/pz_api";

// polyfill
//require("whatwg-fetch");
import request from "request-promise-native";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const DEFAULT_EMAIL = "a@a.com";
const DEFAULT_PASSWORD = "a";
const DEFAULT_BASE_URL = "https://localhost:5050";

function fetchDispatcher(options) {
	// allow my self-signed cert yet
	options.insecure = true;
	options.rejectUnauthorized = false;

	// mimic how fetch API sends back the full response
	options.resolveWithFullResponse = true;

	// fill in the right fields for data
	if(options.data && options.headers["content-type"] === "application/json") {
		const dataStr = options.data;
		delete(options.data);
		options.body = dataStr;
	}
	return request(options);
}

// fill in window.fetch
if(typeof(window) === "undefined") {
	window = {};
}
window.fetch = fetchDispatcher;

describe("login", () => {
	it("should fail to login with bad credentials", () => {
		const api = new pzAPI(DEFAULT_BASE_URL);
		expect.assertions(1);
		return api.login(DEFAULT_EMAIL, "bad password")
			.catch((response) => {
				expect(response.statusCode).toBe(401);
			});
	});

	it("login should succeed with good credentials and get token", () => {
		const api = new pzAPI(DEFAULT_BASE_URL);
		expect.assertions(1);
		// NOTE: should create this account
		return api.login(DEFAULT_EMAIL, DEFAULT_PASSWORD)
			.then((token) => {
				expect(token).toBeTruthy();
			});
	});
});

describe("getEntries", () => {
	it("Should fail gracefully if there is no token", () => {
		expect.assertions(1);
		const api = new pzAPI(DEFAULT_BASE_URL);
		// NOTE: should create this account
		return api.getEntries()
			.catch((err) => {
				expect(true).toBe(true);
			});
	});

	it("should get entries with good token", () => {
		expect.assertions(1);
		const api = new pzAPI(DEFAULT_BASE_URL);
		// NOTE: should create this account
		return api.login(DEFAULT_EMAIL, DEFAULT_PASSWORD)
			.then((token) => {
				return api.getEntries();
			}).then((entries) => {
				expect(entries.length).toBeGreaterThanOrEqual(1);
			});
	});
});

describe("getEntry", () => {
	it("Should successfully decrypt an existing entry", () => {
		expect.assertions(3);
		const api = new pzAPI(DEFAULT_BASE_URL);
		return api.login(DEFAULT_EMAIL, DEFAULT_PASSWORD)
			.then((token) => {
				return api.getEntries();
			}).then((entries) => {
				// decrypt the first entry
				const entryId = entries[0].id;
				return api.getEntry(entryId, DEFAULT_PASSWORD);
			}).then((entry) => {
				expect(entry).toHaveProperty("account");
				expect(entry).toHaveProperty("username");
				expect(entry).toHaveProperty("password");
			});
	});
});

describe("createEntry and deleteEntry", () => {
	it("Should create a new entry which is then deleted", () => {
		expect.assertions(5);
		const api = new pzAPI(DEFAULT_BASE_URL);
		// fill these variables in as we go
		let newEntryId = null;
		let numEntries = 0;
		return api.login(DEFAULT_EMAIL, DEFAULT_PASSWORD)
			.then((token) => {
				return api.getEntries();
			}).then((entries) => {
				numEntries = entries.length;
			}).then(() => {
				return api.createEntry({
					"account": "foo",
					"username": "bar",
					"password": "baz",
					"extra": "some xtra here",
					"has_2fa": false
				}, DEFAULT_PASSWORD);
			}).then((entryId) => {
				// decrypt that entry
				newEntryId = entryId;
				return api.getEntry(entryId, DEFAULT_PASSWORD);
			}).then((entry) => {
				expect(entry).toHaveProperty("account");
				expect(entry).toHaveProperty("username");
				expect(entry).toHaveProperty("password");
				return api.deleteEntry(entry.id);
			}).then(() => {
				// just make sure deletion succeeds
				return api.getEntry(newEntryId, DEFAULT_PASSWORD);
			}).catch((response) => {
				//console.log(response);
				expect(response.statusCode).toBe(400);
				return api.getEntries();
			}).then((entries) => {
				expect(entries.length).toBe(numEntries);
			});
	});
});
