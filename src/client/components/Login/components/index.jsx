import React from 'react';
import axios from 'axios'
import { withRouter } from 'react-router'

class Login extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			username: '',
			password: ''
		};
		
		this.formIsValid = this.formIsValid.bind(this);
		this.login = this.login.bind(this);
		
	};
	
	
	
	
	
	login() {
	
		var headers = {
            'Content-Type': 'application/json'
        };
		
		//make HTTP request to account service API
		axios.post('http://localhost:4200/users/login', {
				"username": this.state.username,
				"password": this.state.password
			},
			headers
		).then(res => {
			
			this.props.submit(true);
			console.log(res);
			window.location.assign("/home");
		})
		.catch(error => {
			this.props.submit(false);
			console.log('error');
		});
	};

	
	onSubmitHandler(e) {
		
		
	
		if (this.formIsValid()) {
		
			//reset background colors if correct
			var usrnField = document.getElementById('usernameField');
			var pswdField = document.getElementById('passwordField');
			usrnField.style.backgroundColor = "";
			pswdField.style.backgroundColor = "";
			
			this.login();
		}
		else {
			var usrnField = document.getElementById('usernameField');
			var pswdField = document.getElementById('passwordField');
			
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
		}
	};
	
	
	formIsValid() {
		return (this.state.password.length > 0 && this.state.username.length > 0 );
	};
	
	
	usernameChange(e) {
		this.setState({username: e.target.value});
	};
	
	pswChange(e) {
		this.setState({password: e.target.value});
	};
		

	render() {
	
		return (
			<div>
			
			<h1>Login</h1>
			<br />
			Username: <input id="usernameField" type="text" value={this.state.username} onChange={this.usernameChange.bind(this)} />
			<br />
			Password: <input id="passwordField" type="password" value={this.state.password} onChange={this.pswChange.bind(this)}/>
			<br />
			<button onClick={this.onSubmitHandler.bind(this)}>Submit</button>
			<br />
			<br />
			<a href="url" >Register</a>
			
			</div>
		);
	}
}

export default withRouter(Login);