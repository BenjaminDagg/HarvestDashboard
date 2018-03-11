import React from 'react';
import { IndexRoute } from 'react-router';
import Map from './components';

export default (
  <IndexRoute name="map" components={{ content: Map }} />
);