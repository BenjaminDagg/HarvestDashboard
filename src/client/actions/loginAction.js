import axios from 'axios';

export function fetchUser(usr, pswrd) {
	let credentials = usr + ':' + pswrd;
	let basic = btoa(credentials);
	basic = 'Basic ' + basic;

	//put token in authorizatio header
	let headers = {
		'Content-Type': 'application/json'
	};
	axios.defaults.headers.Authorization = basic;
	return function(dispatch) {
		axios
			.post('http://localhost:4200/authenticate', {}, headers)
			.then(AuthenticationResp => {
				const token = AuthenticationResp.data.credentials.access_token;
				//use token to call login and get user info
				headers = {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				};
				dispatch({ type: 'FETCH_TOKEN_FULFILLED', payload: token });
				axios.defaults.headers.Authorization = token;
				//make HTTP request to account service API
				axios
					.post(
						'http://localhost:4200/users/login',
						{
							username: usr,
							password: pswrd
						},
						headers
					)
					.then(res => {
						dispatch({ type: 'FETCH_USER_FULFILLED', payload: res.data.data });
						window.location.assign('/home');
					})
					.catch(error => {
						if (error.code) {
							dispatch({ type: 'FETCH_USER_REJECTED', payload: error.code });
						}
					});
			})
			.catch(error => {
				dispatch({ type: 'FETCH_TOKEN_REJECTED', payload: error });
			});
	};
}

export function clearUser() {
	return { type: 'CLEAR_USER', payload: null };
}
