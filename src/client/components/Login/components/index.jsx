import React from 'react';
import axios from 'axios'
import { withRouter } from 'react-router'

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
		
	};
	
	
	
	
	
	login() {
	
		//make a token for authentication 
		var credentials = this.state.username + ':' + this.state.password;
		var basic = btoa(credentials);
		basic = 'Basic ' + basic;

		//put token in authorizatio header
		var headers = {
			'Content-Type': 'application/json',
			
		};
		axios.defaults.headers.Authorization = basic;
		
		//make call to authorize to get bearer token
		axios.post('http://localhost:4200/authenticate' , {}, headers)
		.then (res => {
			console.log(res);
			var token = res.data.credentials.access_token;
			
			//use token to call login and get user info
			headers = {
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + token
        	};
			
			axios.defaults.headers.Authorization = token;
			//make HTTP request to account service API
			axios.post('http://localhost:4200/users/login', {
				"username": this.state.username,
				"password": this.state.password
			},
			headers
			).then(res => {
				console.log(res);
				this.props.submit(true, res.data, token);
				window.location.assign("/home");
			})
			.catch(error => {
		
			
				if (error.code) {
					console.log(error.code);
					this.setState({error: true});
				
				}
			
			
			});
		})
		.catch (error => {
			this.setState({error: true});
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
	
		var errStyle = {
			color: 'red',
			visibility: this.state.error ? 'visible' : 'hidden'
		};
	
		return (
			<div>
			{this.props.user != null && prompt(this.props.user.data.user._id) }
			<h1>Login</h1>
			<br />
			Username: <input id="usernameField" type="text" value={this.state.username} onChange={this.usernameChange.bind(this)} />
			<br />
			Password: <input id="passwordField" type="password" value={this.state.password} onChange={this.pswChange.bind(this)}/>
			<br />
			<button onClick={this.onSubmitHandler.bind(this)}>Submit</button>
			<br />
			<span id="loginError" style={errStyle}>Incorrect Username or Password</span>
			<br />
			<br />
			<a href="url" >Register</a>
			
			</div>
		);
	}
}

export default withRouter(Login);