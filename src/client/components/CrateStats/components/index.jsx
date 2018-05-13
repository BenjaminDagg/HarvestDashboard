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



class CrateStats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			crateData: null,
			crateDataToday: null,
			crateDataAll: null,
			cpdFetchError: false,

		};
		this.getAllCrateData = this.getAllCrateData.bind(this);
		this.renderCrateStats = this.renderCrateStats.bind(this)
		this.getCrateDataToday = this.getCrateDataToday.bind(this);
		this.getMax = this.getMax.bind(this);
		this.drawCpdGraph = this.drawCpdGraph.bind(this);
		this.getCrateDataWeek = this.getCrateDataWeek.bind(this);		

	}

	componentDidMount() {
		
		this.getCrateDataWeek();
		this.getCrateDataToday();
		this.getAllCrateData();
	}


	getCrateDataWeek() {
		if (!this.props.id || this.props.bearer === '' || this.state.cpdFetchError == true || this.state.crateData != null) {
			return;
		}
		console.log('in crate stats');
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer
		};

		axios.defaults.headers.Authorization = this.props.bearer.toString();
		
		var to = moment().utc('-8:00').toISOString().slice(0,16) + 'Z';
		var from = moment(moment().utc('-8:00').toISOString()).utc('-8:00').subtract(7, 'd').toISOString().slice(0,16) + 'Z';
	

		//make HTTP request to account service API

		axios
			.get(
				'http://localhost:2000/harvest/numcrates/between?from=' +
					from +
					'&to=' +
					to +
					'&id=' +
					this.props.id,
				
				headers
			)
			.then(res => {
				var data = res.data;
				console.log(data);
				this.setState({ crateData: data });
				this.setState({ cpdFetchError: false });
			})
			.catch(error => {
				if (error.code) {
					this.setState({ cpdFetchError: true });
				}
			});
	}
	
	
	
	
	getCrateDataToday() {
		if (!this.props.id || this.props.bearer === '' || this.state.cpdFetchError == true || this.state.crateData != null) {
			return;
		}
		console.log('in crate stats');
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer
		};

		axios.defaults.headers.Authorization = this.props.bearer.toString();
		
		var from = moment(moment().utc('-8:00')).utc('-8:00').startOf('day').toISOString().slice(0,16) + 'Z';
		var to = moment(moment().utc('-8:00')).utc('-8:00').endOf('day').toISOString().slice(0,16) + 'Z';
		

		//make HTTP request to account service API

		axios
			.get(
				'http://localhost:2000/harvest/numcrates/between?from=' +
					from +
					'&to=' +
					to +
					'&id=' +
					this.props.id,
				
				headers
			)
			.then(res => {
				var data = res.data;
				console.log(data);
				this.setState({ crateDataToday: data });
				this.setState({ cpdFetchError: false });
			})
			.catch(error => {
				if (error.code) {
					this.setState({ cpdFetchError: true });
				}
			});
	}
	
	
	
	
	getAllCrateData() {
		if (!this.props.id || this.props.bearer === '' || this.state.cpdFetchError == true || this.state.crateData != null) {
			return;
		}
		console.log('in crate stats');
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer
		};

		axios.defaults.headers.Authorization = this.props.bearer.toString();
		
		var from = moment('2018-01-01').utc('-8:00').toISOString().slice(0,16) + 'Z';
		var to = moment().utc('-8:00').toISOString().slice(0,16) + 'Z';
		console.log('to = ' + to + ' from = ' + from);

		//make HTTP request to account service API

		axios
			.get(
				'http://localhost:2000/harvest/numcrates/between?from=' +
					from +
					'&to=' +
					to +
					'&id=' +
					this.props.id,
				
				headers
			)
			.then(res => {
				var data = res.data;
				console.log(data);
				this.setState({ crateDataAll: data });
				this.setState({ cpdFetchError: false });
			})
			.catch(error => {
				if (error.code) {
					this.setState({ cpdFetchError: true });
				}
			});
	}
	

	


	drawCpdGraph() {
		if (this.state.cpdFetchError == true) {
			return <div>Invalid date parameters</div>;
		}

		if (this.state.crateData == null) {
			return <div>Loading data</div>;
		}

		var crateData = this.state.crateData.cratesPerDay;

		var data = {
			x: 'x',
			xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
			columns: [['x'], ['crates:']],
			type: 'bar',
			selection: {
				draggable: true
			}
		};
		var bar = {
			width: {
				ratio: 0.5
			}
		};
		for (var key in crateData) {
			var newDaet = new Date(key).toISOString();
			data.columns[0].push(newDaet);
			data.columns[1].push(crateData[key]);
		}

		var axis = {
			y: {
				label: {
					text: '# Crates',
					position: 'outer-middle'
				},
				tick: {
					fit: true,
					max: this.getMax(crateData)
				}
			},
			x: {
				type: 'timeseries',
				localtime: true,
				tick: {
					fit: true,
					format: '%Y-%m-%d %H:%M'
				},
				label: {
					text: 'Date',
					position: 'outer-center'
				},
				fit: true
			}
		};
		const size = {
			
			height: 400
		};

		var zoom = {
			enabled: true,
			extent: [1, 100]
		};

		return (
			<div id="cpdContainer">
				<C3Chart zoom={zoom} bar={bar} axis={axis} size={size} id="chart" data={data} />
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




	renderCrateStats() {
		if (this.state.crateDataAll == null || this.state.crateData == null || this.state.crateDataToday == null) {
			return;
		}
		
		return (
			<div>
				<span>Crates Harvested (24H): {this.state.crateDataToday.numCrates}</span>
				<br/>
				<span>Crates Harvested (Week): {this.state.crateData.numCrates}</span>
				<br/>
				<span>Total crates harvested: {this.state.crateDataAll.numCrates}</span>
			</div>
			
		);
	}


	render() {
		
		


		var cpdGraph = this.drawCpdGraph();
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
					
					{cpdGraph}
				</div>
				
			</div>
		);
	}
}

export default withRouter(CrateStats);
