import React from 'react';
import { IndexRoute } from 'react-router';
import Home from './components/Home';

export default (
  <IndexRoute name="home" components={{ main: Home, sidebar: undefined }} />
);
