//
// This is the client side entry point for the React app.
//

import React from 'react';
import { render } from 'react-dom';
import { routes } from './routes';
import { Router, browserHistory, Route } from 'react-router';
import store from './store';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
//
import { notify } from 'react-notify-toast';
//
import './styles/base.css';

import Login from './components/Login/components';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
//
// Add the client app start up code to a function as window.webappStart.
// The webapp's full HTML will check and call it once the js-content
// DOM is created.
//
require.ensure(
  ['./sw-registration'],
  require => {
    require('./sw-registration')(notify);
  },
  'sw-registration'
);
//

window.webappStart = () => {
  render(
      <Provider store={store}>
        <Router history={browserHistory}>{routes}</Router>
      </Provider>,
    document.querySelector('.js-content')
  );
};
