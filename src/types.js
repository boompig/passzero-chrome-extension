// @flow

export type T_DecEntry = {
	id: number;
	account: string;
	username: string;
	password: string;
	extra: ?string;
	has_2fa: bool;
	// exact types
	is_encrypted: false;
};

export type T_EncEntry = {
	id: number;
	account: string;
	// exact types
	is_encrypted: true;
};

export type T_LoginForm = {
	email: string,
	password: string
};
