import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';

import Map from '../../Map/components';

var moment = require('moment');

class MapContainer extends React.Component {
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
			}
		};

		this.getMaps = this.getMaps.bind(this);
		this.getUserScans = this.getUserScans.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);

		this.scanStartChanged = this.scanStartChanged.bind(this);
		this.scanEndChanged = this.scanEndChanged.bind(this);
		this.getScansWithDates = this.getScansWithDates.bind(this);
	}

	componentDidMount() {
		//set scanEndDate to the current date
		var timeDate = moment()
			.utc('-8:00')
			.toISOString();
		this.setState({ scanEndDate: timeDate.slice(0, 16) });
	}

	getMaps() {
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer
		};

		//make HTTP request to account service API
		axios
			.get('http://localhost:1234/maps', headers)
			.then(res => {
				const mapData = res.data;

				this.setState({ maps: mapData });
			})
			.catch(error => {});
	}

	getMapCenter(geometry) {
		if (geometry.type == 'GeometryCollection') {
			return geometry.geometries[0].coordinates[0];
		} else {
			return geometry.coordinates[0];
		}
	}

	getUserScans() {
		//check if user props loaded yet or if scans already gotten
		if (this.props.user == null || this.state.scans != null || this.props.bearer === '') {
			return <div>You must be logged in to view maps </div>;
		}

		const userId = this.props.user._id;
		console.log('UserID ', userId);
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

				console.log(points);
				axios
					.get('http://localhost:1234/maps/user/' + userId.toString(), headers)
					.then(res => {
						const mapData = res.data;
						this.setState({ maps: mapData });
					})
					.catch(error => {});

				this.setState({ scanCoords: points });
				this.setState({ scans: scans });
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
			height: '100%'
		};
		return (
			<div style={style}>
				<span>Filter Scans:</span>
				<br />
				start Date:{' '}
				<input value={this.state.scanStartDate} type="datetime-local" onChange={this.scanStartChanged} />
				<br />
				End Date: <input value={this.state.scanEndDate} type="datetime-local" onChange={this.scanEndChanged} />
				<br />
				<button onClick={this.getScansWithDates}>Submit</button>
				{this.state.user != null}
				{this.state.scans != null && (
					<Map
						title={'Scan Locations'}
						geometry={this.state.scanCoords.shape}
						center={this.state.scans[0].location.coordinates}
					/>
				)}
				<br />
				{this.state.scanFetchError.status == true && (
					<span style={error}>{this.state.scanFetchError.message}</span>
				)}
				{this.state.maps != null &&
					this.state.maps.map(data => {
						return <Map title={data.name} center={this.getMapCenter(data.shape)} geometry={data.shape} />;
					})}
			</div>
		);
	}
}

export default withRouter(MapContainer);
