import React from 'react';
import { IndexRoute } from 'react-router';
import MapContainer from './components';

export default (
  <IndexRoute name="map" components={{ content: MapContainer }} />
);