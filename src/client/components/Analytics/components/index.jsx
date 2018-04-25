import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';
import C3Chart from 'react-c3js';
import LineChart from 'react-c3js';
import 'c3/c3.css';
import style from './style.css';
var moment = require('moment');

function format(date) {
	date = new Date(date);

	var day = ('0' + date.getDate()).slice(-2);
	var month = ('0' + (date.getMonth() + 1)).slice(-2);
	var year = date.getFullYear();

	return year + '-' + month + '-' + day;
}

class Analytics extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			crateData: null,
			meanDistData: null,
			crateTimeData: null,
			selectedUnit: 'hour',

			cpdStartDate: this.props.user !== null ? this.props.user.createdAt : '2018-01-01T00:00Z',
			cpdEndDate: this.props.user !== null ? this.props.user.createdAt : null,
			cpdFetchError: false,

			timeStartDate: '2018-01-01T00:00Z',
			timeEndDate: null,

			distFetchError: false,
			distDetailVisible: false,
			distDetailTarget: null,
			distUnit: 'miles',
			distStartDate: this.props.user != null ? this.props.user.createdAt : '2018-01-01T00:00:00Z',
			distEndDate: this.props.user != null ? this.props.user.createdAt : null
		};
		this.drawMeanDistGraph = this.drawMeanDistGraph.bind(this);
		this.getMeanDistData = this.getMeanDistData.bind(this);
		this.getMax = this.getMax.bind(this);
		this.getCrateDate = this.getCrateData.bind(this);
		this.drawCpdGraph = this.drawCpdGraph.bind(this);
		this.getCrateTimeData = this.getCrateTimeData.bind(this);
		this.drawMeanTimeGraph = this.drawMeanTimeGraph.bind(this);
		this.unitChanged = this.unitChanged.bind(this);
		this.distUnitChanged = this.distUnitChanged.bind(this);
		this.cpdStartChanged = this.cpdStartChanged.bind(this);
		this.cpdEndChanged = this.cpdEndChanged.bind(this);
		this.timeStartChanged = this.timeStartChanged.bind(this);
		this.timeEndChanged = this.timeEndChanged.bind(this);
		this.getTimeWithDates = this.getTimeWithDates.bind(this);
		this.getCpdWithDates = this.getCpdWithDates.bind(this);

		this.distStartChanged = this.distStartChanged.bind(this);
		this.distEndChanged = this.distEndChanged.bind(this);
		this.getDistWithDates = this.getDistWithDates.bind(this);
	}

	componentWillMount() {
		this.getCrateData();
		this.getMeanDistData();
		this.getCrateTimeData();

		//creating initial date for cpdEndDate
		var cpdDate = moment()
			.utc('-8:00')
			.toISOString();
		this.setState({ cpdEndDate: cpdDate.slice(0, 16) });

		//setting initial date for distEndDat
		var distDate = moment()
			.utc('-8:00')
			.toISOString();
		this.setState({ distEndDate: distDate.slice(0, 16) });

		//set initial date for time end date
		var timeDate = moment()
			.utc('-8:00')
			.toISOString();
		this.setState({ timeEndDate: timeDate.slice(0, 16) });
	}

	componentWillUnmount() {
		clearTimeout(this.timer);
	}

	getCrateData() {
		if (this.props.bearer === '' || this.state.cpdFetchError == true || this.state.crateData != null) {
			return;
		}

		console.log('getcratedata');
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;

		var from = this.state.cpdStartDate;
		var to = this.state.cpdEndDate;

		//make HTTP request to account service API

		axios
			.get(
				'http://localhost:2000/harvest/numcrates/between?from=' +
					from +
					'&to=' +
					to +
					'&id=' +
					this.props.user._id,
				{
					username: this.state.username,
					password: this.state.password
				},
				headers
			)
			.then(res => {
				var data = res.data;

				this.setState({ crateData: data });
				this.setState({ cpdFetchError: false });
			})
			.catch(error => {
				if (error.code) {
					console.log(error.code);
					this.setState({ cpdFetchError: true });
				}
			});
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

	getMeanDistData() {
		if (
			this.props.bearer === '' ||
			this.state.distFetchError == true ||
			this.state.meanDistData != null ||
			!this.props.user
		) {
			return;
		}

		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		axios.defaults.headers.Authorization = this.props.bearer;

		var from = this.state.distStartDate;
		var to = this.state.distEndDate;
		var unit = this.state.distUnit;

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
				this.setState({ distFetchError: false });
				this.setState({ meanDistData: data });
			})
			.catch(error => {
				if (error.response) {
					this.setState({ distFetchError: true });
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

		if (this.state.meanDistData == null) {
			return <div>Loading Data..</div>;
		}

		var distData = this.state.meanDistData.distance;
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
					text: 'Distance (miles)',
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
				<h3>
					Mean distance: {this.state.meanDistData.meandist.toFixed(2)} {this.state.distUnit}
				</h3>
				<C3Chart axis={axis} size={size} id="meanDist" data={data} />
			</div>
		);
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
			width: window.innerWidth,
			height: 500
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

	//calls harvest api to get data for time between each crate
	//then stores it in state
	getCrateTimeData() {
		if (this.props.bearer === '' || this.state.crateTimeData != null || !this.props.user) {
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
		var from = this.state.timeStartDate;
		var to = this.state.timeEndDate;
		var uid = this.props.user._id;
		var unit = this.state.selectedUnit;
		console.log('from = ' + from + ' and to = ' + to);
		console.log('unit = ' + unit);
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
				console.log(res);
				var data = res.data;
				this.setState({ crateTimeData: data });
			})
			.catch(error => {
				if (error.response) {
					this.setState({ error: true });
					//this.props.submit(false);
				}
			});
	}

	drawMeanTimeGraph() {
		if (this.props.bearer == '') {
			return <div>You must be logged in to view analytics</div>;
		}

		if (this.state.crateTimeData == null) {
			return <div>Loading Data..</div>;
		}

		var timeData = this.state.crateTimeData.crates;
		console.log(timeData);
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
					text: 'time (' + this.state.selectedUnit + ')',
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
				<h3>
					Mean time: {this.state.crateTimeData.meantime.toFixed(2)} {this.state.selectedUnit}s
				</h3>
				<C3Chart axis={axis} size={size} id="meanDist" data={data} />
			</div>
		);
	}

	unitChanged(event) {
		this.setState({ crateTimeData: null });
		this.setState({ selectedUnit: event.target.value });
		this.getCrateTimeData();
	}

	distUnitChanged(event) {
		this.setState({ meanDistData: null });
		this.setState({ distUnit: event.target.value });
		this.getMeanDistData();
	}

	cpdStartChanged(event) {
		var newDate = event.target.value;
		this.setState({ cpdStartDate: newDate });
	}

	cpdEndChanged(event) {
		var newDate = event.target.value;
		this.setState({ cpdEndDate: newDate });
	}

	timeStartChanged(event) {
		var newDate = event.target.value;
		this.setState({ timeStartDate: newDate });
	}

	timeEndChanged(event) {
		var newDate = event.target.value;
		this.setState({ timeEndDate: newDate });
	}

	getTimeWithDates() {
		if (!this.state.timeStartDate || !this.state.timeEndDate) {
			return;
		}
		this.setState({ crateTimeData: null });
		this.getCrateTimeData();
	}

	getCpdWithDates() {
		if (!this.state.cpdStartDate || !this.state.cpdEndDate) {
			return;
		}
		this.setState({ crateData: null });
		this.setState({ cpdFetchError: false });
		console.log('button pressed');
		this.getCrateData();
	}

	distStartChanged(event) {
		this.setState({ distStartDate: event.target.value });
	}

	distEndChanged(event) {
		this.setState({ distEndDate: event.target.value });
	}

	getDistWithDates() {
		if (!this.state.distStartDate || !this.state.distEndDate) {
			return;
		}
		this.setState({ distFetchError: false });
		this.setState({ meanDistData: null });
		this.getMeanDistData();
	}

	render() {
		this.getCrateDate();
		this.getMeanDistData();
		this.getCrateTimeData();

		const data = {
			columns: [['', 30, 200, 100, 400, 150, 250], ['', 50, 20, 10, 40, 15, 25]]
		};

		const size = {
			width: 500,
			height: 500
		};

		const axis = {
			y: {
				label: {
					text: '# Crates',
					position: 'outer-middle'
				}
			},
			x: {
				label: {
					text: 'Date',
					position: 'outer-center'
				}
			}
		};

		var cpdGraph = this.drawCpdGraph();
		var meanDistGraph = this.drawMeanDistGraph();
		var meanTimeGraph = this.drawMeanTimeGraph();

		var style = {
			overflowY: 'auto',
			height: '80%'
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
					<h1>Crates Harvested Per Day</h1>
					Start Date:{' '}
					<input value={this.state.cpdStartDate} onChange={this.cpdStartChanged} type="datetime-local" />
					<br />
					End Date:{' '}
					<input value={this.state.cpdEndDate} type="datetime-local" onChange={this.cpdEndChanged} />
					<br />
					<button onClick={this.getCpdWithDates}>Submit</button>
					<br />
					{cpdGraph}
				</div>
				<div id="meanDist">
					<h1>Crate Mean Distance</h1>
					Start Date:{' '}
					<input value={this.state.distStartDate} onChange={this.distStartChanged} type="datetime-local" />
					<br />
					End Date:{' '}
					<input value={this.state.distEndDate} type="datetime-local" onChange={this.distEndChanged} />
					<br />
					Unit:{' '}
					<select onChange={this.distUnitChanged} value={this.state.distUnit}>
						<option value="miles">Mile</option>
						<option value="kilometers">Km</option>
						<option value="ft">feet</option>
					</select>
					<br />
					<button onClick={this.getDistWithDates}>Submit</button>
					{meanDistGraph}
				</div>

				<div id="meanTime">
					<h1>Mean Time Between Crates</h1>
					start Date:{' '}
					<input value={this.state.timeStartDate} type="datetime-local" onChange={this.timeStartChanged} />
					<br />
					End Date:{' '}
					<input value={this.state.timeEndDate} type="datetime-local" onChange={this.timeEndChanged} />
					<br />
					Select unit:{' '}
					<select onChange={this.unitChanged} value={this.state.selectedUnit}>
						<option value="day">Day</option>
						<option value="hr">Hour</option>
						<option value="min">Min</option>
						<option value="sec">Sec</option>
					</select>
					<br />
					<button onClick={this.getTimeWithDates}>Submit</button>
					{meanTimeGraph}
				</div>
			</div>
		);
	}
}

export default withRouter(Analytics);
