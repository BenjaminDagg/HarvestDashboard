import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { fetchUser } from '../../../actions/loginAction';
import { connect } from 'react-redux';
import style from './style.css';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';

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
			visibility: this.state.error ? 'visible' : 'hidden',
			'margin': '0 aut0'
		};

		var formStyle = {
			width: '300px',
			height: '200px',
			margin: '0 auto',

		};

		var spanStyle = {
			'float': 'left',
			'font-size': '20px'

		};

		var inputStyle = {
			'display' : 'flex',
			'margin': '0 auto',
			'font-size' : '16px'
		};

		var fieldContainer = {
			'width': '100%',
			'height': '50%',
			'margin-top': '20px'
		};

		var btnStyle = {
			'margin': '0 auto',
			'height': '40px',
			'width': '70px',
			'font-family': 'Roboto, Helvetica, Arial, sans-serif',
			'background-color': 'white',
			'color': '#838383',
			'border': '1px solid #838383',
			'border-radius': '4px',
			'display' : 'flex',
			'padding': '12px'
		};

		var registerStyle = {
			'width': '100%',
			'height': '20px',
			'margin': '0 auto',
			'text-align': 'center',
			'font-size': '20px'
		};

		return (
			<div>
				{this.props.user != null && prompt(this.props.user._id)}
				<h1 className={style.title}>Login</h1>
				<br />
				<div style={formStyle}>
						<form noValidate autoComplete="off">
								<TextField style={inputStyle}
										id="usernameField"
										label="Username"
										type="text"
										value={this.state.username}
										onChange={this.usernameChange.bind(this)}
										margin="normal"
								/>
								<br />
								<div style={fieldContainer}>
										<TextField style={inputStyle}
												id="passwordField"
												type="password"
												value={this.state.password}
												onChange={this.pswChange.bind(this)}
							          label="Password"
							          autoComplete="current-password"
							          margin="normal"
					      		/>
								</div>
					 </form>
					 <span id="loginError" style={errStyle}>
							Incorrect Username or Password
					 </span>
					 <Button variant="raised" style={btnStyle} onClick={this.onSubmitHandler.bind(this)}>Login</Button>
				</div>
				<br />
				<div style={registerStyle}>
					<span id="loginError" style={errStyle}>
					Incorrect Username or Password
					</span>
				</div>
				<div style={registerStyle}>
				<Button variant="raised" style={{'margin': '0 auto'}} href="/register">Register</Button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({});

const mapActionsToProps = {
	onFetchUser: fetchUser
};

export default withRouter(connect(mapStateToProps, mapActionsToProps)(Login));
