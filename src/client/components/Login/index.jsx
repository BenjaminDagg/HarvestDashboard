import React from 'react';
import { IndexRoute } from 'react-router';
import Login from './components';

export default (
  <IndexRoute name="login" components={{ content: Login }} />
);
