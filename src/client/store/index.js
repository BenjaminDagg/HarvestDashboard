import { applyMiddleware, createStore } from 'redux';

import rootReducer from '../reducers';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';

const middleware = applyMiddleware(promise(), thunk, createLogger());

const initialState = window.__PRELOADED_STATE__;
const persistedState = localStorage.getItem('reduxState')
	? JSON.parse(localStorage.getItem('reduxState'))
	: initialState;

const store = createStore(rootReducer, persistedState, middleware);
store.subscribe(() => {
	localStorage.setItem('reduxState', JSON.stringify(store.getState()));
});

export default store;
