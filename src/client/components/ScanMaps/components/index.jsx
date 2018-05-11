import React from 'react';
import { Link, withRouter } from 'react-router';
import axios from 'axios';
import { LinearProgress } from 'material-ui/Progress';
import Fade from 'material-ui/transitions/Fade';
import Map from '../../Map/components';
import TextField from 'material-ui/TextField';
import { Grid, Paper } from 'material-ui';
import Button from 'material-ui/Button';

var moment = require('moment');

class ScanMaps extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			maps: null, //array of map objects of the users maps
			user: this.props.user || null,
			scans: null, //array of usrs scan objects
			scanCoords: {
				//geometry collection that scans coordinate for all of users scans
				shape: {
					type: 'GeometryCollection',
					geometries: []
				}
			},
			bearer: this.props.bearer || null,
			scanStartDate: '2018-01-01T00:00', //start date to to get users scans
			scanEndDate: null, //end date to get users scans,
			scanFetchError: {
				status: false,
				message: ''
			},
			isLoading: true
		};

		this.getUserScans = this.getUserScans.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);

		this.scanStartChanged = this.scanStartChanged.bind(this);
		this.scanEndChanged = this.scanEndChanged.bind(this);
		this.getScansWithDates = this.getScansWithDates.bind(this);
	}

	componentWillMount() {
		//set scanEndDate to the current date
		var timeDate = moment()
			.utc('-8:00')
			.toISOString();
		this.setState({ scanEndDate: timeDate.slice(0, 16) });
	}

	componentDidMount() {
		//set scanEndDate to the current date
		var timeDate = moment()
			.utc('-8:00')
			.toISOString();
		this.setState({ scanEndDate: timeDate.slice(0, 16) });
	}

	getMapCenter(geometry) {
		if (geometry.type === 'GeometryCollection') {
			return geometry.geometries[0].coordinates[0];
		} else {
			return geometry.coordinates[0];
		}
	}

	getUserScans() {
		console.log(this.props.user);
		//check if user props loaded yet or if scans already gotten
		if (this.props.id === null || this.state.scans !== null || this.props.bearer === '') {
			//console.log('error');
			return <div>You must be logged in to view maps </div>;
		}
		console.log('in');
		const userId = this.props.id;

		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		var from = this.state.scanStartDate + 'Z';
		var to = this.state.scanEndDate + 'Z';

		axios.defaults.headers.Authorization = this.props.bearer;

		//make call to maps service api
		axios
			.get('http://localhost:1234/scans?from=' + from + '&to=' + to + '&id=' + userId.toString(), {}, headers)
			.then(res => {
				console.log(res);
				//parse scans from response JSON
				const scans = res.data;

				if (scans.length == 0) {
					var error = {
						status: true,
						message: 'No scans found in this time frame'
					};
					this.setState({ scanFetchError: error });

					return;
				}

				//get user maps from the scans
				var userMaps = new Array();

				var points = {
					shape: {
						type: 'GeometryCollection',
						geometries: []
					}
				};

				for (var i = 0; i < scans.length; i++) {
					var coords;
					var point;
					if (scans[i].location.coordinates[0] instanceof Array) {
						coords = scans[i].location.coordinates[0];
						scans[i].location.coordinates = scans[i].location.coordinates[0];
					} else {
						coords = [scans[i].location.coordinates[0], scans[i].location.coordinates[1]];
					}

					point = {
						type: 'Point',
						coordinates: coords,
						scan: scans[i]
					};
					points.shape.geometries.push(point);
				}

				axios
					.get('http://localhost:1234/maps/user/' + userId.toString(), headers)
					.then(res => {
						const mapData = res.data;
						this.setState({ maps: mapData });
					})
					.catch(error => {});

				this.setState({ scanCoords: points });
				this.setState({ scans: scans });
				this.setState({ isLoading: false });
			})
			.catch(error => {
				console.log('in error');
				var error = {
					status: true,
					message: 'Invalid date parameters'
				};
				this.setState({ scanFetchError: error });
			});
	}

	//called when user changes scan start date input
	scanStartChanged(event) {
		console.log('start changed ' + event.target.value);
		this.setState({ scanStartDate: event.target.value });
	}

	//called when user changed scan end date input
	scanEndChanged(event) {
		console.log('end changed ' + event.target.value);
		this.setState({ scanEndDate: event.target.value });
	}

	//called when submit button on scan inputs is pressed
	//recalls api get /scans route to get scans with
	//new data parameters
	getScansWithDates() {
		console.log('submit clicked');
		if (!this.state.scanStartDate || !this.state.scanEndDate) {
			return;
		}
		var error = {
			status: false,
			message: ''
		};
		this.setState({ isLoading: true });
		this.setState({ scanFetchError: error });
		this.setState({ scans: null });
		this.setState({ scanCoords: null });
		this.getUserScans();
	}

	render() {
		var view = this.getUserScans();

		var error = {
			color: 'red'
		};

		var style = {
			overflowY: 'auto',
			height: '90%'
		};

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' },
			Button: { marginTop: 10, marginBottom: 10 }
		};
		return (
			<div style={style}>
				<div style={styles.Paper}>
					<Fade
						style={styles}
						in={this.state.isLoading}
						style={{
							transitionDelay: this.state.isLoading ? '800ms' : '0ms'
						}}
						unmountOnExit
					>
						<LinearProgress />
					</Fade>
				</div>
				<Grid container spacing={24}>
					<Grid item xs>
						<Paper style={styles.Paper}>
							<h3>Filter Scans:</h3>
							<form noValidate>
								<TextField
									id="datetime-local"
									label="Start Date"
									type="datetime-local"
									defaultValue={this.state.scanStartDate}
									onChange={this.scanStartChanged}
									InputLabelProps={{
										shrink: true
									}}
								/>
							</form>
							<form noValidate>
								<TextField
									id="datetime-local"
									label="End Date"
									type="datetime-local"
									defaultValue={this.state.scanEndDate}
									onChange={this.scanEndChanged}
									InputLabelProps={{
										shrink: true
									}}
								/>
							</form>
							<Button
								variant="raised"
								color="primary"
								style={styles.Button}
								onClick={this.getScansWithDates}
							>
								Submit
							</Button>
						</Paper>
					</Grid>
				</Grid>
				{this.state.user !== null}
				{this.state.scans !== null && (
					<Map
						title={'Scan Locations'}
						geometry={this.state.scanCoords.shape}
						center={this.state.scans[0].location.coordinates}
						fit={true}
					/>
				)}
				<br />
				{this.state.scanFetchError.status === true && (
					<span style={error}>{this.state.scanFetchError.message}</span>
				)}
			</div>
		);
	}
}

export default withRouter(ScanMaps);
