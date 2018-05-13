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

class Scans extends React.Component {
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
			isLoading: true
		};

		this.renderScanMap = this.renderScanMap.bind(this);
		this.getUserScans = this.getUserScans.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);

		
	}
	
	
	componentDidMount() {
		this.getUserScans();
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

		const userId = this.props.id;
		
		
		//get users scans from database
		var headers = {
			'Content-Type': 'application/json',
			Authorization: 'bearer' + this.props.bearer.toString()
		};

		

		axios.defaults.headers.Authorization = this.props.bearer;

		//make call to maps service api
		axios
			.get('http://localhost:1234/scans?id=' + userId.toString(), {}, headers)
			.then(res => {
				
				//parse scans from response JSON
				const scans = res.data;

			
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
				
				this.setState({ scanCoords: points });
				this.setState({ scans: scans });
				this.setState({isLoading: false});
			})
			.catch(error => {
				console.log('in error');
				
			});
	}
	
	
	renderScanMap() {
		if (this.state.scans == null || this.state.scanCoords == null) {
			return (<div>Loading...</div>);
		}
		
		return (
			<Map
				title={'Scan Locations'}
				geometry={this.state.scanCoords.shape}
				center={this.state.scans[0].location.coordinates}
				fit={true}
			/>
		);
	}


	render() {
		
		var map = this.renderScanMap();

		

		var style = {
			
			height: '90%',
			width: '100%'
		};

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' },
			Button: { marginTop: 10, marginBottom: 10 }
		};
		return (
			<div style={style}>
				{map}
			</div>
		);
	}
}

export default withRouter(Scans);
