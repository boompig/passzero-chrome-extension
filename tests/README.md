# Setup

You need to create a file `tests/secret-test-creds.js` which exports `testEmail` and `testPassword` constants. You can then add these credentials to the service database.

You can modify whether you hit the "real" site or the fake site by editing `DEFAULT_BASE_URL` in `tests/passzero_api.test.js`.

