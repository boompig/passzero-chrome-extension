import React from "react";
import PropTypes from "prop-types";

/**
 * The login widget
 * On success, need to call some sort of parent event...
 */
class LoginForm extends React.Component {
	constructor() {
		super();
		this.state = {
			password: ""
		};
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		let email = this.props.email;
		let password = this.state.password;
		this.props.onLoginSubmit({
			email: email,
			password: password
		});
	}

	handlePasswordChange(event) {
		this.setState({ "password": event.target.value });
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

LoginForm.propTypes = {
	email: PropTypes.string.isRequired,
	onLoginSubmit: PropTypes.function.isRequired,
	onEmailChange: PropTypes.function.isRequired,
	errorMsg: PropTypes.string
};

export default LoginForm;
