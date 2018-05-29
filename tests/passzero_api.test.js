import { pzAPI } from "../src/pz_api";
import { testEmail, testPassword } from "./secret-test-creds";

// polyfill
require("whatwg-fetch");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//const DEFAULT_BASE_URL = "http://localhost:5050";
const DEFAULT_BASE_URL = "https://passzero.herokuapp.com";

let entryId = null;

/**
 * Create an entry in the test account
 */
beforeAll(() => {
	const entry = {
		account: "foo",
		username: "bar",
		password: "baz",
		has_2fa: true,
		extra: "foobarbaz",
	};
	const api = new pzAPI(DEFAULT_BASE_URL);
	return api.login(testEmail, testPassword)
		.then(() => {
			return api.createEntry(entry, testPassword);
		})
		.then((_entryId) => {
			entryId = _entryId;
			return api.logout();
		});
});

afterAll(() => {
	const api = new pzAPI(DEFAULT_BASE_URL);
	return api.login(testEmail, testPassword)
		.then(() => {
			// entryId is the ID for the entry created in setup harness
			return api.deleteEntry(entryId, testPassword);
		}).then(() => {
			return api.logout();
		});
});

describe("login", () => {
	it("should fail to login with bad credentials", () => {
		const api = new pzAPI(DEFAULT_BASE_URL);
		expect.assertions(1);
		return api.login(testEmail, "bad password")
			.catch((response) => {
				expect(response.status).toBe(401);
			});
	});

	it("login should succeed with good credentials and get token", () => {
		const api = new pzAPI(DEFAULT_BASE_URL);
		expect.assertions(1);
		// NOTE: should create this account
		return api.login(testEmail, testPassword)
			.then((token) => {
				expect(token).toBeTruthy();
			});
	});
});

describe("getEntries", () => {
	it("should fail gracefully if there is no token", () => {
		expect.assertions(1);
		const api = new pzAPI(DEFAULT_BASE_URL);
		// NOTE: should create this account
		return api.getEntries()
			.catch((err) => {
				expect(err.statusMessage).toBe("NO_TOKEN");
			});
	});

	it("should get entries with good token", () => {
		expect.assertions(1);
		const api = new pzAPI(DEFAULT_BASE_URL);
		// NOTE: should create this account
		return api.login(testEmail, testPassword)
			.then((token) => {
				return api.getEntries();
			}).then((entries) => {
				expect(entries.length).toBeGreaterThanOrEqual(1);
			});
	});
});

describe("getEntry", () => {
	it("should successfully decrypt an existing entry", () => {
		expect.assertions(3);
		const api = new pzAPI(DEFAULT_BASE_URL);
		return api.login(testEmail, testPassword)
			.then((token) => {
				return api.getEntries();
			}).then((entries) => {
				// decrypt the first entry
				const entryId = entries[0].id;
				return api.getEntry(entryId, testPassword);
			}).then((entry) => {
				expect(entry).toHaveProperty("account");
				expect(entry).toHaveProperty("username");
				expect(entry).toHaveProperty("password");
			});
	});
});

describe("createEntry and deleteEntry", () => {
	it("should create a new entry which is then deleted", () => {
		expect.assertions(5);
		const api = new pzAPI(DEFAULT_BASE_URL);
		// fill these variables in as we go
		let newEntryId = null;
		let numEntries = 0;
		return api.login(testEmail, testPassword)
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
				}, testPassword);
			}).then((entryId) => {
				// decrypt that entry
				newEntryId = entryId;
				return api.getEntry(entryId, testPassword);
			}).then((entry) => {
				expect(entry).toHaveProperty("account");
				expect(entry).toHaveProperty("username");
				expect(entry).toHaveProperty("password");
				return api.deleteEntry(entry.id);
			}).then(() => {
				// just make sure deletion succeeds
				return api.getEntry(newEntryId, testPassword);
			}).catch((response) => {
				expect(response.status).toBe(400);
				return api.getEntries();
			}).then((entries) => {
				expect(entries.length).toBe(numEntries);
			});
	});
});

describe("logout", () => {
	it("should successfully log out", () => {
		expect.assertions(1);
		const api = new pzAPI(DEFAULT_BASE_URL);
		return api.login(testEmail, testPassword)
			.then(token => {
				return api.logout();
			}).then((response) => {
				// just make sure we're here
				expect(response.status).toBe("success");
			});
	});

	it("should not be possible to use the token after logout", () => {
		expect.assertions(2);
		const api = new pzAPI(DEFAULT_BASE_URL);
		let oldToken = null;
		return api.login(testEmail, testPassword)
			.then(token => {
				oldToken = token;
				return api.logout();
			}).then((response) => {
				// just make sure we're here
				expect(response.status).toBe("success");
			}).then(() => {
				// internal token should be cleared
				return api.getEntries();
			}).catch((err) => {
				expect(1).toBe(1);
			});
	});
});
