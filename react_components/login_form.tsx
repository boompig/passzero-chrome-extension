import * as React from "react";

import PassZeroAPI from "./passzero_api";

/**
 * The login widget
 * On success, need to call some sort of parent event...
 *
 * Expected props:
 *      - email: the email in the form
 *      - onEmailChange: callback for when email field changes
 *      - onLoginSuccess: callback for when login is successful
 */
class LoginForm extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: null,
            password: ""
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        PassZeroAPI.validateLogin(this.props.email, this.state.password)
        .success((response) => {
            console.log("Logged in!");
            this.props.onLoginSuccess();
        }).error((response, textStatus, errorThrown) => {
            var errorMsg;
            if (response.status === 0) {
                errorMsg = "This is meant to be run in an extension, not as a standalone site";
            } else if (response.status === 401) {
                errorMsg = "The username or password is incorrect";
            } else {
                errorMsg = "Failed to log in";
            }
            console.log(response);
            console.log(textStatus);
            console.log(errorThrown);
            this.setState({
                errorMsg: errorMsg
            });
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value
        });
    }

    render() {
        return (
            <form id="login-form" role="form" onSubmit={ this.handleSubmit }>
                { this.state.errorMsg
                    ? <div className="error">{ this.state.errorMsg }</div>
                    : null }
                <input className="form-control" type="email"
                    ref="loginEmail" placeholder="email"
                    required={ true } tabIndex={ 1 }
                    value={ this.props.email }
                    onChange={ this.props.onEmailChange } />
                <input className="form-control" type="password"
                    ref="loginPassword"
                    placeholder="password"
                    required={ true } tabIndex={ 2 }
                    value={ this.state.password }
                    onChange={ this.handlePasswordChange } />
                <button className="form-control btn btn-success"
                    type="submit">Log In</button>
            </form>
        );
    }
};

export default LoginForm;
