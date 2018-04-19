const initialUser = {
	user: {
		id: null,
		first_name: null,
		last_name: null,
		username: null,
		createdAt: null
	},
	bearer: null,
	fetching: false,
	fetched: false,
	isLoggedIn: false,
	error: null
};

export default function reducer(state = initialUser, action) {
	switch (action.type) {
		case 'FETCH_USER': {
			return { ...state, fetching: true };
		}
		case 'FETCH_USER_REJECTED': {
			return {
				...state,
				fetching: false,
				error: action.payload
			};
		}
		case 'FETCH_USER_FULFILLED': {
			return {
				...state,
				fetching: false,
				fetched: true,
				isLoggedIn: true,
				user: action.payload.user
			};
		}
		case 'FETCH_TOKEN_FULFILLED': {
			return { ...state, bearer: action.payload };
		}
		case 'FETCH_TOKEN_REJECTED': {
			return { ...state, error: action.payload };
		}
		case 'CLEAR_USER': {
			return {};
		}
		default:
			return state;
	}
}
