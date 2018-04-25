import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { fetchUser } from '../../../actions/loginAction';
import { connect } from 'react-redux';

class Login extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: '',
			user: this.props.user || null,
			error: false
		};

		this.formIsValid = this.formIsValid.bind(this);
		this.login = this.login.bind(this);
	}

	login() {
		this.props.onFetchUser(this.state.username, this.state.password);
	}

	onSubmitHandler(e) {
		if (this.formIsValid()) {
			//reset background colors if correct
			var usrnField = document.getElementById('usernameField');
			var pswdField = document.getElementById('passwordField');
			usrnField.style.backgroundColor = '';
			pswdField.style.backgroundColor = '';

			this.login();
		} else {
			var usrnField = document.getElementById('usernameField');
			var pswdField = document.getElementById('passwordField');

			if (this.state.username.length == 0) {
				usrnField.style.backgroundColor = 'pink';
			} else {
				usrnField.style.backgroundColor = '';
			}
			if (this.state.password.length == 0) {
				pswdField.style.backgroundColor = 'pink';
			} else {
				pswdField.style.backgroundColor = '';
			}
		}
	}

	formIsValid() {
		return this.state.password.length > 0 && this.state.username.length > 0;
	}

	usernameChange(e) {
		this.setState({ username: e.target.value });
	}

	pswChange(e) {
		this.setState({ password: e.target.value });
	}

	render() {
		var errStyle = {
			color: 'red',
			visibility: this.state.error ? 'visible' : 'hidden'
		};

		return (
			<div>
				{this.props.user != null && prompt(this.props.user._id)}
				<h1>Login</h1>
				<br />
				Username:{' '}
				<input
					id="usernameField"
					type="text"
					value={this.state.username}
					onChange={this.usernameChange.bind(this)}
				/>
				<br />
				Password:{' '}
				<input
					id="passwordField"
					type="password"
					value={this.state.password}
					onChange={this.pswChange.bind(this)}
				/>
				<br />
				<button onClick={this.onSubmitHandler.bind(this)}>Submit</button>
				<br />
				<span id="loginError" style={errStyle}>
					Incorrect Username or Password
				</span>
				<br />
				<br />
				<a href="url">Register</a>
			</div>
		);
	}
}

const mapStateToProps = state => ({});

const mapActionsToProps = {
	onFetchUser: fetchUser
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Login));
