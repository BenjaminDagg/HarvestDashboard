import React from 'react';
import axios from 'axios'
import { withRouter } from 'react-router'

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
	
		var errStyle = {
			color: 'red',
			visibility: this.state.error ? 'visible' : 'hidden'
		};
		
		var success = {
			color: 'green',
			
		};
		
		
	
		return (
			<div>
				<h1>Register</h1>
				
				Username: <input id="usernameField" type="text" value={this.state.username} onChange={this.usernameChange.bind(this)} />
				<br />
				First Name: <input id="firstnameField" type="text" value={this.state.firstname} onChange={this.firstnameChange.bind(this)} />
				<br />
				Last Name: <input id="lastnameField" type="text" value={this.state.lastname} onChange={this.lastnameChange.bind(this)} />
				<br />
				Password: <input id="passwordField" type="password" value={this.state.password} onChange={this.pswChange.bind(this)}/>
				<br />
				<span id="loginError" style={errStyle}>{this.state.errorMessage}</span>
				<br />
				
				{this.state.loginSuccess == true &&
					<span id="loginLink" style={success}>Registration Successfull. Continue to </span>
					
				}
				{this.state.loginSuccess == true &&
					<a href='/login'>Login</a>	
				}
				<br />
				<button onClick={this.onSubmitHandler.bind(this)}>Submit</button>
				
				
			<br />
			</div>
		);
	}
}

export default withRouter(Register);