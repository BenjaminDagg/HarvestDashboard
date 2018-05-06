import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { fetchUser } from '../../../actions/loginAction';
import { connect } from 'react-redux';
import style from './style.css';

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
	
			'float': 'right',
			'border': '1px solid #757677',
    		'border-radius': '4px',
			'height' : '25px',
			'background-color': 'white',
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
					<div>
						<span style={spanStyle}>Username:{' '}</span>
						<input style={inputStyle}
							id="usernameField"
							type="text"
							value={this.state.username}
							onChange={this.usernameChange.bind(this)}
						/>
					</div>
					<br />
					<div style={fieldContainer}>
						<span style={spanStyle}>Password:{' '}</span>
						<input style={inputStyle}
						id="passwordField"
						type="password"
						value={this.state.password}
						onChange={this.pswChange.bind(this)}
					/>
					</div>
					<span id="loginError" style={errStyle}>
						Incorrect Username or Password
					</span>
					<button style={btnStyle} onClick={this.onSubmitHandler.bind(this)}>Submit</button>
				</div>
				<br />
				
				<br />
				<div style={registerStyle}>
					<span id="loginError" style={errStyle}>
					Incorrect Username or Password
					</span>
				</div>
				<div style={registerStyle}>
					<a style={{'margin': '0 auto'}} href="/register">Register</a>
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
