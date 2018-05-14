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
			fieldId: this.props.fieldId || ''
			
		};

		
		this.renderStatistics = this.renderStatistics.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);
		this.getUserFields = this.getUserFields.bind(this);
	}
	
	
	componentDidMount() {
		this.getUserFields();
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
	
	componentWillReceiveProps(nextProps) {
		this.setState({fieldId: nextProps.fieldId});
		
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
				

				var fields = res.data;
				
				this.setState({ fields: res.data });
				this.setState({ isLoading: false });
			})
			.catch(error => {
				console.log(error);
			});
	}
	
	
	renderStatistics() {
		if ( this.state.fields == null || this.state.fieldId == null || this.state.fieldId == '') {
			return (<div>Loading...</div>);
		}
		
		var field = null;
		for (var i = 0; i < this.state.fields.length;i++) {
			if (this.state.fields[i]._id == this.state.fieldId) {
				field = this.state.fields[i];
			}
		}
		
		//calculates remaining crates
		const percentHarvested = field.data.percentHarvested.toFixed(2) * 100;
		var numCrates = field.scans.length;
		var remainingCrates = Math.ceil((numCrates / field.data.percentHarvested.toFixed(2)));
		
		//calculate estimated completion date
		//sort by date ascending
		var scans = field.scans;
		
		scans.sort(function(a,b) {
			return (a.datetime < b.datetime) ? -1 : ((a.datetime > b.datetime) ? 1 : 0);
		});
		
		var startDate = scans[0].datetime;
		startDate = moment(startDate).utc('-8:00');
		
		var now = moment().utc('-8:00');
		
		var diff = now - startDate;
		var daysPassed = Math.ceil(diff / 86400000);
		
		//estimated date to completion is how many days passed / percent complete
		//whcih gives number of days left. Then add that to current date
		var percent = field.data.percentHarvested;
		var daysLeft = Math.ceil(daysPassed / percent);
		
		var completionDate = moment(moment().utc('-8:00')).utc('-8:00').add(daysLeft, 'd').toISOString().slice(0,10);
		
		return (
			<div>
				<span>Crates Harvested: {field.scans.length}</span>
				<br /><br />
				<span>Percent of land harvested: {percentHarvested}%</span>
				<br /><br />
				<span>Remaining crates to complete: {remainingCrates}</span>
				<br/><br/>
				<span>Estimated Completion Date: {completionDate}</span>
			</div>
		)
		
	}
	
	

	render() {
		//this.getUserFields();

		var error = {
			color: 'red'
		};

		var style = {
			width: '100%',
			height: '100%',
			'padding': '10px'
		};

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' }
		};

		var stats = this.renderStatistics();
		
		return (
			<div>	
				
				{this.state.fieldId != null && this.state.fields != null &&
				this.state.fields.length > 0 &&
					<Paper id="field-stats-background" elevation={4} style={{'padding':'10px'}}>
						<h2>Field Statistics</h2>
						{stats}
						
					</Paper>
				}
			</div>
		);
	}
}

export default withRouter(FieldStats);
