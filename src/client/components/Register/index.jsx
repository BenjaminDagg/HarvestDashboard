import React from 'react';
import { IndexRoute } from 'react-router';
import Register from './components';

export default (
  <IndexRoute name="register" components={{ content: Register }} />
);
