//
// This is the client side entry point for the React app.
//

import React from 'react';
import { render } from 'react-dom';
import { routes } from './routes';
import { Router, browserHistory } from 'react-router';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers';
//
import { notify } from 'react-notify-toast';
//
import './styles/base.css';

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
  const initialState = window.__PRELOADED_STATE__;
  const store = createStore(rootReducer, initialState);

  // Serves as temp quick fix for setting the root height
  const rootNode = document.querySelector('.js-content');
  rootNode.style.height = '100%';

  render(
    <Provider store={store}>
      <Router history={browserHistory}>{routes}</Router>
    </Provider>,
    rootNode
  );
};
