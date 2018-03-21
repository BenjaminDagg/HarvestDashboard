import React from 'react';
import { Route } from 'react-router';
import HomeRoutes from '../home';
import App from './components/App';
import Home from '../home/components/Home';
import Login from '../components/Login/components';
import LoginRoute from '../components/Login';
import Map from '../components/MapContainer/components';
import Analytics from '../components/Analytics/components';

export default (
  <Route path="/" name="app" component={App}>
  	<Route path="/home" component={Home} />
  	<Route path="/login" component={Login} />
  	<Route path="/map" component={Map} />
  	<Route path="/analytics" component={Analytics} />
  </Route>
);
