import React from 'react';
import { Route } from 'react-router';
import HomeRoutes from '../home';
import App from './components/App';

export default (
  <Route path="/" name="app" component={App}>
    {HomeRoutes}
  </Route>
);
