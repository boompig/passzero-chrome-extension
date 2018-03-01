// @flow

import * as React from "react";
import type { T_LoginForm } from "./types";

let Console = console;

type ILoginFormProps = {
	email: string,
	onLoginSubmit: (form: T_LoginForm) => void,
	onEmailChange: (event: SyntheticEvent<HTMLElement>) => void,
	errorMsg: ?string
};

type ILoginFormState = {
	password: string
};

/**
 * The login widget
 * On success, need to call some sort of parent event...
 */
class LoginForm extends React.Component<ILoginFormProps, ILoginFormState> {

	handleSubmit: Function;
	handlePasswordChange: Function;

	constructor(props: ILoginFormProps) {
		super(props);
		this.state = {
			password: ""
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
	}

	handleSubmit(event: SyntheticEvent<HTMLElement>) {
		event.preventDefault();
		let email = this.props.email;
		let password = this.state.password;
		this.props.onLoginSubmit({
			email: email,
			password: password
		});
	}

	handlePasswordChange(event: SyntheticEvent<HTMLElement>) {
		if(event.target instanceof window.HTMLInputElement) {
			this.setState({ "password": event.target.value });
		} else {
			Console.error("Failed to update password");
		}
	}

	render() {
		return (
			<form id="login-form" role="form" onSubmit={ this.handleSubmit }>
				{ this.props.errorMsg ?
					<div className="error">{ this.props.errorMsg }</div> : null }
				<input className="form-control" type="email" placeholder="email"
					required="required" tabIndex="1"
					value={ this.props.email }
					onChange={ this.props.onEmailChange } />
				<input className="form-control" type="password"
					onChange={ this.handlePasswordChange }
					placeholder="password"
					required="required" tabIndex="2" />
				<button className="form-control btn btn-success" type="submit">Log In</button>
			</form>
		);
	}
}

export default LoginForm;
