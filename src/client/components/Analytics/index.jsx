import React from 'react';
import { IndexRoute } from 'react-router';
import Analytics from './components';

export default (
  <IndexRoute name="analytics" components={{ content: Analytics }} />
);