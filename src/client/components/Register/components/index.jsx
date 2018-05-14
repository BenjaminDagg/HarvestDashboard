import React from 'react';
import axios from 'axios'
import { withRouter } from 'react-router'
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';

class Register extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: '',
			firstname: '',
			lastname: '',
			user: this.props.user || null,
			error: false,
			errorMessage: 'Missing Fields',
			loginSuccess: false
		};
		this.formIsValid = this.formIsValid.bind(this);
		this.register = this.register.bind(this);

	};


	/*
		Update state when any of the fields change
	*/
	usernameChange(e) {
		this.setState({username: e.target.value});
	};

	firstnameChange(e) {
		this.setState({firstname: e.target.value});
	};

	lastnameChange(e) {
		this.setState({lastname: e.target.value});
	};

	pswChange(e) {
		this.setState({password: e.target.value});
	};



	register() {

		var headers = {
			'Content-Type': 'application/json',

		};

		axios.post('http://localhost:4200/users/register', {
			"username": this.state.username,
			"password": this.state.password,
			"firstname": this.state.firstname,
			"lastname": this.state.lastname
			},
			headers
		).then(res => {
				console.log(res);

				this.setState({loginSuccess: true});

			})
			.catch(error => {
				if (error.response) {
					switch (error.response.status) {
					case (400):
						this.setState({errorMessage: 'Username is taken.'});
						break;
					default:
						console.log('other');
				}
				}
			});
	}


	onSubmitHandler(e) {

		console.log(this.formIsValid());

		if (this.formIsValid()) {

			//reset background colors if correct
			var usrnField = document.getElementById('usernameField');
			var pswdField = document.getElementById('passwordField');
			usrnField.style.backgroundColor = "";
			pswdField.style.backgroundColor = "";

			this.register();
		}
		else {
			var usrnField = document.getElementById('usernameField');
			var pswdField = document.getElementById('passwordField');
			var firstField = document.getElementById('firstnameField');
			var lastField = document.getElementById('lastnameField');

			//make missing fields have pink backgroun
			//or grey fi they are not missing and display error
			if (this.state.username.length == 0) {
				usrnField.style.backgroundColor = "pink";
			}
			else {
				usrnField.style.backgroundColor = "";
			}
			if (this.state.password.length == 0) {
				pswdField.style.backgroundColor = "pink";
			}
			else {
				pswdField.style.backgroundColor = "";
			}
			if (this.state.firstname.length == 0) {
				firstField.style.backgroundColor = "pink";
			}
			else {
				firstField.style.backgroundColor = "";
			}
			if (this.state.lastname.length == 0) {
				lastField.style.backgroundColor = "pink";
			}
			else {
				lastField.style.backgroundColor = "";
			}

			this.setState({error: true});
		}
	};


	formIsValid() {
		return (this.state.password.length > 0 &&
				this.state.username.length > 0 &&
				this.state.firstname.length > 0 &&
				this.state.lastname.length > 0);
	};


	render() {

		//turns error messages on or off
		var errStyle = {
			color: 'red',
			visibility: this.state.error ? 'visible' : 'hidden'
		};

		var success = {
			color: 'green',

		};


		//css for header
		var headerStyle = {
			'textAlign': 'center',
			'fontFamily': "Roboto, Helvetica, Arial, sans-serif",
			'color': '#848484'
		};

		//css for div that holds form inputs
		var formStyle = {
			width: '350px',
			height: '800px',
			margin: '0 auto',


		};

		//css for the text of each input
		var spanStyle = {
			'float': 'left',
			'fontSize': '20px'

		};

		//css for each input in form
		var inputStyle = {
			'display' : 'flex',
			'margin': '0 auto',
			'fontSize' : '16px'
		};

		//css for each row div of form
		var fieldContainer = {
			'width': '100%',
			'height': '30px',
			'margin-top': '20px'
		};

		//css for error message divs
		var registerStyle = {
			'width': '100%',
			'height': '20px',
			'margin': '0 auto',
			'textAlign': 'center',
			'fontSize': '20px'
		};

		//css for submit button
		var btnStyle = {
			'margin': '0 auto',
			'height': '40px',
			'width': '70px',
			'fontFamily': 'Roboto, Helvetica, Arial, sans-serif',
			'backgroundColor': 'white',
			'color': '#838383',
			'border': '1px solid #838383',
			'borderRadius': '4px',
			'display' : 'flex',
			'padding': '12px'
		};

		return (
			<div>
				<h1 style={headerStyle}>Register</h1>

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
								<TextField style={inputStyle}
										id="firstnameField"
										label="First name"
										type="text"
										value={this.state.firstname}
										onChange={this.firstnameChange.bind(this)}
										margin="normal"
								/>
								<br />
									<TextField style={inputStyle}
											id="lastnameField"
											label="Last name"
											type="text"
											value={this.state.lastname}
											onChange={this.lastnameChange.bind(this)}
											margin="normal"
									/>
									<br />
										<TextField style={inputStyle}
												id="passwordField"
												type="password"
												value={this.state.password}
												onChange={this.pswChange.bind(this)}
												label="Password"
												autoComplete="current-password"
												margin="normal"
										/>
					 		</form>

							<div style={registerStyle}>
								<span id="loginError" style={errStyle}>{this.state.errorMessage}</span>
							</div>

							<Button variant="raised" style={btnStyle} onClick={this.onSubmitHandler.bind(this)}>Register</Button>
						</div>
								<br />
								{this.state.loginSuccess == true &&
									<span id="loginLink" style={success}>Registration Successfull. Continue to </span>

								}
								{this.state.loginSuccess == true &&
									<a href='/login'>Login</a>
								}
								<br />

			</div>
		);
	}
}

export default withRouter(Register);
