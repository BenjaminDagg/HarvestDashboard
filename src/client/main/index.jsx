import React from 'react';
import { Route } from 'react-router';
import HomeRoutes from '../home';
import App from './components/App';
import Home from '../home/components/Home';
import Login from '../components/Login/components';
import Register from '../components/Register/components';
import LoginRoute from '../components/Login';
import Map from '../components/MapContainer/components';
import Analytics from '../components/Analytics/components';
import RealTime from '../components/realtime/components';
import ScanMaps from '../components/ScanMaps/components';
import FieldMaps from '../components/FieldMaps/components';

export default (
  <Route path="/" name="app" component={App}>
  	<Route path="/home" component={Home} />
  	<Route path="/login" component={Login} />
  	<Route path="/register" component={Register} />
  	<Route path="/map" component={Map} >
  		<Route path="/map/scan" component={ScanMaps} />
  		<Route path="/map/fields" component={FieldMaps} />
  	</Route>
  	<Route path="/analytics" component={Analytics} />
  	<Route path="/realtime" component={RealTime} />
  </Route>
);
