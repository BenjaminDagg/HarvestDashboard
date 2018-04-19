import React from 'react';
import { IndexRoute } from 'react-router';
import RealTime from './components';

export default (
  <IndexRoute name="realtime" components={{ content: RealTime }} />
);