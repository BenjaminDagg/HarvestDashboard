import React from 'react';
import { Link, withRouter } from 'react-router';
import axios from 'axios';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Map from '../../Map/components';
import GuageChart from '../../GuageChart/components';
import { LinearProgress } from 'material-ui/Progress';
import Fade from 'material-ui/transitions/Fade';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';

import Tabs, { Tab } from 'material-ui/Tabs';
import { Paper } from 'material-ui';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';


function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};


var moment = require('moment');

class FieldStats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			
			user: this.props.user || null,
			bearer: this.props.bearer || null,
			fields: null, //array of map object of users fields
			isLoading: true,
			field: null	//field that was passed in by parent
			
		};

		
		this.getMapCenter = this.getMapCenter.bind(this);
		this.getUserFields = this.getUserFields.bind(this);
	}

	
	/*
	Gets location to mmake iniitial coordinates of map 
	*/
	getMapCenter(geometry) {
		if (geometry.type == 'GeometryCollection') {
			return geometry.geometries[0].coordinates[0];
		} else {
			return geometry.coordinates[0];
		}
	}

	//get map objects for users fields with GET /maps/fields
	getUserFields() {
		if (!this.props.id || this.state.fields != null || this.props.bearer == '') {
			return <div>Loading data...</div>;
		}

		const userId = this.props.id;

		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;

		//make call to maps service api
		axios
			.get('http://localhost:1234/maps/fields?id=' + userId.toString(), {}, headers)
			.then(res => {
				console.log(res.data);

				var fields = res.data;
				
				if (fields.length > 0) {
					//send id of field to parent
					this.props.sendFieldToParent(fields[0]._id);
					this.setState({selectedField: fields[0]});
				}
				this.setState({ fields: res.data });
				this.setState({ isLoading: false });
			})
			.catch(error => {
				console.log(error);
			});
	}
	
	

	render() {
		this.getUserFields();

		var error = {
			color: 'red'
		};

		var style = {
			width: '100%',
			height: '100%'
		};

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' }
		};

		

		return (
			<div>	
				<Paper elevation={4}>
					<h2>Field Statistics</h2>
				</Paper>
				
			</div>
		);
	}
}

export default withRouter(FieldStats);
