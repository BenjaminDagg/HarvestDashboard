import React from 'react';
import { Link, withRouter } from 'react-router';
import axios from 'axios';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Map from '../../Map/components';
import style from './style.css';
import { Paper, Tabs } from 'material-ui';
import { Tab } from 'material-ui/Tabs';
import { Grid } from 'material-ui';
import { LinearProgress } from 'material-ui/Progress';
import Fade from 'material-ui/transitions/Fade';

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
			},

			fields: null, //array of map object of users fields
			currentTab: 0,
			isLoading: true
		};

		this.getMaps = this.getMaps.bind(this);
		this.getUserScans = this.getUserScans.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);

		this.scanStartChanged = this.scanStartChanged.bind(this);
		this.scanEndChanged = this.scanEndChanged.bind(this);
		this.getScansWithDates = this.getScansWithDates.bind(this);

		this.getUserFields = this.getUserFields.bind(this);

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event, value) {
		console.log('Event: ', value);
		this.setState({ currentTab: value });
		switch (value) {
			case 0:
				this.props.router.push('/map');
				break;
			case 1:
				this.props.router.push('/map/scan');
				break;
			case 2:
				this.props.router.push('/map/fields');
		}
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

	getMapCenter(map) {
		//no data given in map. use scan coordinates as center
		if (!map.shape.geometry) {
			
			//search through scans to see which of them has this map
			for (var i = 0; i < this.state.scans.length;i++) {
				
				for (var j = 0; j < this.state.scans[i].mapIds.length;j++) {
					
					if (this.state.scans[i].mapIds[j] == map._id) {
						//extract coordinates
						if (this.state.scans[i].location.coordinates[0] instanceof Array) {
							
							var coords = this.state.scans[i].location.coordinates[0];
							
							return coords;
							
							
						} else {
						
							var coords = [this.state.scans[i].location.coordinates[0], this.state.scans[i].location.coordinates[1]];
							
							return coords;
						}
					}
				}
			}
		}
		else if (map.shape.geometry.type == 'GeometryCollection') {
			return geometry.geometries[0].coordinates[0];
		} 
		else {
			return map.shape.geometry.coordinates[0];
		}
	}

	//get map objects for users fields with GET /maps/fields
	getUserFields() {
		if (!this.props.user || this.state.fields != null || this.props.bearer == '') {
			return <div>Loading data...</div>;
		}

		const userId = this.props.user._id;

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
				
				this.setState({ fields: res.data });
			})
			.catch(error => {
				console.log(error);
			});
	}

	getUserScans() {
		//check if user props loaded yet or if scans already gotten
		if (this.props.user == null || this.state.scans != null || this.props.bearer === '') {
			return <div>You must be logged in to view maps </div>;
		}

		const userId = this.props.user._id;
		
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

				axios
					.get('http://localhost:1234/maps/user/' + userId.toString(), headers)
					.then(res => {
						const mapData = res.data;
						
						
						this.setState({ maps: mapData });	
						this.setState({ isLoading: false });
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
				this.setState({isLoading: false});
				
			});
	}

	//called when user changes scan start date input
	scanStartChanged(event) {
		
		this.setState({ scanStartDate: event.target.value });
	}

	//called when user changed scan end date input
	scanEndChanged(event) {
		
		this.setState({ scanEndDate: event.target.value });
	}

	//called when submit button on scan inputs is pressed
	//recalls api get /scans route to get scans with
	//new data parameters
	getScansWithDates() {
		
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
		var childrenWithProps = React.Children.map(this.props.children, child => {
			return React.cloneElement(child, {
				user: this.props.user,
				id: this.props.user._id,
				bearer: this.props.bearer
			});
		});

		var view = this.getUserScans();

		//this.getUserFields();

		var error = {
			color: 'red'
		};

		var style = {
			overflowY: 'auto',
			height: '100%'
		};

		var user = this.props.user;
		var bearer = this.props.bearer;
		//current path
		var currentPath = this.props.location.pathname;
		
		if (currentPath !== '/map') {
			style.overflowY = 'hidden';
		}

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' }
		};

		return (
			<div style={style}>
				<Paper elevation={4}>
					<Tabs
						value={this.state.currentTab}
						onChange={this.handleChange}
						centered
						indicatorColor="primary"
						textColor="primary"
					>
						<Tab label="Your Maps" />
						<Tab label="Scans" />
						<Tab label="Your Fields" />
					</Tabs>
				</Paper>

				{childrenWithProps}
				{this.state.maps && this.state.maps.length == 0 &&
					<div>
						<h2>No maps found</h2>
					</div>
				}
				{this.state.maps !== null &&
					currentPath === '/map' &&
					this.state.maps.length > 0 &&
					this.state.maps.map(data => {
						
						return (
							<Map
								key={data.name}
								title={data.name}
								center={this.getMapCenter(data)}
								geometry={data.shape}
							/>
						);
					})}

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
			</div>
		);
	}
}

export default withRouter(MapContainer);
