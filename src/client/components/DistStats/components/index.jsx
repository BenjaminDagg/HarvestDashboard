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



class DistStats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			crateDistDataWeek: null,	//mean time data for this week
			crateDistDataToday: null,	//mean time data for past 24 hrs
			crateDistDataAll: null,		//mean time data for all crates
			cpdFetchError: false,

		};
		
		//methods
		this.getMeanDistDataToday = this.getMeanDistDataToday.bind(this);
		this.getMeanDistDataAll = this.getMeanDistDataAll.bind(this);
		this.getMeanDistDataWeek = this.getMeanDistDataWeek.bind(this);
		this.drawMeanDistGraph = this.drawMeanDistGraph.bind(this);
		this.renderCrateStats = this.renderCrateStats.bind(this)
		this.getMax = this.getMax.bind(this);
		
	}




	//When components load first make api calls to get all data
	componentDidMount() {
		this.getMeanDistDataToday();
		this.getMeanDistDataWeek();
		this.getMeanDistDataAll();
	}

	
	
	getMeanDistDataToday() {
		if (
			this.props.bearer === '' ||
			this.state.distFetchError == true ||
			this.state.crateDistDataToday != null ||
			!this.props.id
		) {
			return;
		}
		console.log('in');
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;
		
		var from = moment(moment().utc('-8:00')).utc('-8:00').startOf('day').toISOString().slice(0,16) + 'Z';
		var to = moment(moment().utc('-8:00')).utc('-8:00').endOf('day').toISOString().slice(0,16) + 'Z';
		var unit = 'ft';
	
		//make HTTP request to account service API
		axios
			.get(
				'http://localhost:2000/harvest/meandist?from=' +
					from +
					'&to=' +
					to +
					'&id=' +
					this.props.user._id +
					'&unit=' +
					unit,
				{
					username: this.state.username,
					password: this.state.password
				},
				headers
			)
			.then(res => {
				var data = res.data;
				
				this.setState({ crateDistDataToday: data });
			})
			.catch(error => {
				if (error.response) {
					
				}
			});
	}
	
	getMeanDistDataAll() {
		if (
			this.props.bearer === '' ||
			this.state.distFetchError == true ||
			this.state.crateDistDataWeek != null ||
			!this.props.id
		) {
			return;
		}
		
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;
		
		var from = moment('2018-01-01').utc('-8:00').toISOString().slice(0,16) + 'Z';
		var to = moment().utc('-8:00').toISOString().slice(0,16) + 'Z';
		
		var unit = 'ft';
	
		//make HTTP request to account service API
		axios
			.get(
				'http://localhost:2000/harvest/meandist?from=' +
					from +
					'&to=' +
					to +
					'&id=' +
					this.props.user._id +
					'&unit=' +
					unit,
				{
					username: this.state.username,
					password: this.state.password
				},
				headers
			)
			.then(res => {
				var data = res.data;
				
				this.setState({ crateDistDataAll: data });
			})
			.catch(error => {
				if (error.response) {
					
				}
			});
	}
	
	
	getMeanDistDataWeek() {
		if (
			this.props.bearer === '' ||
			this.state.distFetchError == true ||
			this.state.crateDistDataWeek != null ||
			!this.props.id
		) {
			return;
		}
		
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;
		
		var to = moment().utc('-8:00').toISOString().slice(0,16) + 'Z';
		var from = moment(moment().utc('-8:00').toISOString()).utc('-8:00').subtract(7, 'd').toISOString().slice(0,16) + 'Z';
		var unit = 'ft';
	
		//make HTTP request to account service API
		axios
			.get(
				'http://localhost:2000/harvest/meandist?from=' +
					from +
					'&to=' +
					to +
					'&id=' +
					this.props.user._id +
					'&unit=' +
					unit,
				{
					username: this.state.username,
					password: this.state.password
				},
				headers
			)
			.then(res => {
				var data = res.data;
				console.log(data);
				this.setState({ crateDistDataWeek: data });
			})
			.catch(error => {
				if (error.response) {
					
				}
			});
	}

	drawMeanDistGraph() {
		if (this.state.distFetchError == true) {
			return <div>Invalid date parameters</div>;
		}

		if (this.props.bearer == '') {
			return <div>You must be logged in to view analytics</div>;
		}

		if (this.state.crateDistDataToday == null || this.state.crateDistDataWeek == null ||
			this.state.crateDistDataAll == null) {
			return <div>Loading Data..</div>;
		}


		
		var distData = this.state.crateDistDataToday.distance;
		
		
		var data = {
			x: 'x',
			columns: [['x'], ['distance: ']],
			onClick: function(value, index) {
				var index = value.index;
				var id = data.columns[0][index];
				var scan = distData[id];
				this.setState({ distDetailVisible: true });
				this.setState({ distDetailTarget: scan });
			}
		};
		for (var key in distData) {
			data.columns[0].push(distData[key].scan._id);
			data.columns[1].push(Math.round(parseFloat(distData[key].distance)));
		}

		var axis = {
			y: {
				label: {
					text: 'Distance (feet)',
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
		if (this.state.crateDistDataAll == null || this.state.crateDistDataWeek == null || this.state.crateDistDataToday == null) {
			return;
		}
		
		return (
			<div>
				<span>Mean Dist (24H): {this.state.crateDistDataToday.meandist.toFixed(2)} ft</span>
				<br/>
				<span>Mean Dist (Week): {this.state.crateDistDataWeek.meandist.toFixed(2)} ft</span>
				<br/>
				<span>Mean Dist (All): {this.state.crateDistDataAll.meandist.toFixed(2)} ft</span>
			</div>
			
		);
	}


	render() {
		
		

		//render graph
		var graph = this.drawMeanDistGraph();
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

export default withRouter(DistStats);
