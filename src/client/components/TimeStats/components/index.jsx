import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';
import C3Chart from 'react-c3js';
import LineChart from 'react-c3js';
import 'c3/c3.css';
import Button from 'material-ui/Button';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import style from './style.css';
var moment = require('moment');



class TimeStats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			crateTimeDataWeek: null,	//mean time data for this week
			crateTimeDataToday: null,	//mean time data for past 24 hrs
			crateTimeDataAll: null,		//mean time data for all crates
			cpdFetchError: false,

		};
		
		//methods
		this.getCrateTimeDataAll = this.getCrateTimeDataAll.bind(this);
		this.getCrateTimeDataToday = this.getCrateTimeDataToday.bind(this);
		this.drawMeanTimeGraph = this.drawMeanTimeGraph.bind(this);
		this.renderCrateStats = this.renderCrateStats.bind(this)
		this.getCrateTimeDataWeek = this.getCrateTimeDataWeek.bind(this);
		this.getMax = this.getMax.bind(this);
		
	}




	//When components load first make api calls to get all data
	componentDidMount() {
		
		this.getCrateTimeDataAll();
		this.getCrateTimeDataToday();
		this.getCrateTimeDataWeek();
	}

	
	
	
	//gets crate mean time data for past week
	getCrateTimeDataWeek() {
		if (this.props.bearer === '' || this.state.crateTimeDataWeek != null || !this.props.user) {
			return;
		}
		
		//set authorization headers
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;

		//call harvest api meantime api
		//set query parameters
		var to = moment().utc('-8:00').toISOString().slice(0,16) + 'Z';
		var from = moment(moment().utc('-8:00').toISOString()).utc('-8:00').subtract(7, 'd').toISOString().slice(0,16) + 'Z';
		var uid = this.props.id;
		var unit = 'sec';

		axios
			.get(
				'http://localhost:2000/harvest/meantime?from=' + from + '&to=' + to + '&id=' + uid + '&unit=' + unit,
				{
					username: this.state.username,
					password: this.state.password
				},
				headers
			)
			.then(res => {
				var data = res.data;
				console.log(data);
				this.setState({ crateTimeDataWeek: data });
			})
			.catch(error => {
				if (error.response) {
					console.log(error);
				}
			});
	}
	
	
	
	
	//gets crate mean time today for past 24 hours
	getCrateTimeDataToday() {
		if (this.props.bearer === '' || this.state.crateTimeDataToday != null || !this.props.user) {
			return;
		}
		
		//set authorization headers
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;

		//call harvest api meantime api
		//set query parameters
		var from = moment(moment().utc('-8:00')).utc('-8:00').startOf('day').toISOString().slice(0,16) + 'Z';
		var to = moment(moment().utc('-8:00')).utc('-8:00').endOf('day').toISOString().slice(0,16) + 'Z';
		var uid = this.props.id;
		var unit = 'sec';

		axios
			.get(
				'http://localhost:2000/harvest/meantime?from=' + from + '&to=' + to + '&id=' + uid + '&unit=' + unit,
				{
					username: this.state.username,
					password: this.state.password
				},
				headers
			)
			.then(res => {
				var data = res.data;
				
				this.setState({ crateTimeDataToday: data });
			})
			.catch(error => {
				if (error.response) {
					this.setState({ error: true });
					//this.props.submit(false);
				}
			});
	}
	
	
	
	
	//gets mean time data for all of users crates
	getCrateTimeDataAll() {
		if (this.props.bearer === '' || this.state.crateTimeDataToday != null || !this.props.user) {
			return;
		}
		
		//set authorization headers
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;

		//call harvest api meantime api
		//set query parameters
		var from = moment('2018-01-01').utc('-8:00').toISOString().slice(0,16) + 'Z';
		var to = moment().utc('-8:00').toISOString().slice(0,16) + 'Z';
		var uid = this.props.id;
		var unit = 'sec';

		axios
			.get(
				'http://localhost:2000/harvest/meantime?from=' + from + '&to=' + to + '&id=' + uid + '&unit=' + unit,
				{
					username: this.state.username,
					password: this.state.password
				},
				headers
			)
			.then(res => {
				var data = res.data;
				this.setState({ crateTimeDataAll: data });
			})
			.catch(error => {
				if (error.response) {
					this.setState({ error: true });
					//this.props.submit(false);
				}
			});
	}



	/*
	Creates line graph to represent todays mean time data
	If api call not done returns 'loading' else returns the graph
	*/
	drawMeanTimeGraph() {
		if (this.props.bearer == '') {
			return <div>You must be logged in to view analytics</div>;
		}

		if (this.state.crateTimeDataToday == null ||
			this.state.crateTimeDataWeek == null ||
			this.state.crateTimeDataAll == null) {
			return <div>Loading Data..</div>;
		}
	
	
		var timeData;
		if (this.state.crateTimeDataToday.meantime > 0) {
			timeData = this.state.crateTimeDataToday.crates;
		}
		else if (this.state.crateTimeDataWeek.meantime > 0) {
			timeData = this.state.crateTimeDataWeek.crates;
		}
		else {
			timeData = this.state.crateTimeDataAll.crates;
		}
		
		var data = {
			x: 'x',
			columns: [['x'], ['time: ']]
		};
		
		
		
		
		for (var key in timeData) {
			data.columns[0].push(timeData[key].crate._id);
			data.columns[1].push(Math.round(parseFloat(timeData[key].time)));
		}

		var axis = {
			y: {
				label: {
					text: 'time (sec)',
					position: 'outer-middle'
				},
				tick: {}
			},
			x: {
				type: 'category',
				tick: {},
				label: {
					text: 'Date',
					position: 'outer-center'
				}
			}
		};
		const size = {
			height: 500
		};

		return (
			<div>
				<C3Chart axis={axis} size={size} id="meanDist" data={data} />
			</div>
		);
	}
	
	
	
	getMax(values) {
		var max = 0;
		for (var key in values) {
			if (values[key] > max) {
				max = values[key];
			}
		}
		return max;
	}



	/*
	When api calls done prints out the mean time from today, this week
	and all time in a div
	If no data or not done loading renders nothing
	*/
	renderCrateStats() {
		//data not loaded yet
		if (this.state.crateTimeDataAll == null || this.state.crateTimeDataWeek == null || this.state.crateTimeDataToday == null) {
			return;
		}
		
		return (
			<div>
				<span>Mean Time (24H): {this.state.crateTimeDataToday.meantime.toFixed(2)} seconds</span>
				<br/>
				<span>Mean Time (Week): {this.state.crateTimeDataWeek.meantime.toFixed(2)} seconds</span>
				<br/>
				<span>Mean Time (All): {this.state.crateTimeDataAll.meantime.toFixed(2)} seconds</span>
			</div>
			
		);
	}


	render() {
		
		

		//render graph
		var graph = this.drawMeanTimeGraph();
		//render stats
		var stats = this.renderCrateStats();

		var style = {
			
			height: '100%'
		};

		var graphStyle = {
			width: '100%'
		};

		return (
			<div style={style}>
				<style>
					{'\
                .c3-line{\
                  fill:none;\
                }\
              '}
				</style>
				<style>
					{
						'\
                .c3-axis path, .c3-axis line {\
                  stroke-width: 1px;\
                  fill : none;\
                  stroke: #000;\
                }\
              '
					}
				</style>

				<div style={graphStyle} id="cpdGraph">
					{stats}
					
					{graph}
				</div>
				
			</div>
		);
	}
}

export default withRouter(TimeStats);
