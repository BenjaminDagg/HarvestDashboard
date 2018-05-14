import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Tabs, { Tab } from 'material-ui/Tabs';
import { Paper } from 'material-ui';
import Typography from 'material-ui/Typography';
import { Link, withRouter } from 'react-router';

import Map from '../../Map/components';


import axios from 'axios';
import C3Chart from 'react-c3js';
import LineChart from 'react-c3js';
import 'c3/c3.css';
import Button from 'material-ui/Button';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';
import TextField from 'material-ui/TextField';

var moment = require('moment');



var moment = require('moment');

class MapSelector extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			maps: null, //array of map objects of the users maps
			selectedMap: "",
			scans: null
		};

		//methods
		this.onMapSelected = this.onMapSelected.bind(this);
		this.renderMapSelect = this.renderMapSelect.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);
		this.renderSelectedMap = this.renderSelectedMap.bind(this);
		this.getMaps = this.getMaps.bind(this);
		
	}
	
	
	
	componentDidMount() {
		this.getMaps();
	}
	
	
	
	
	getMaps() {
		//check if user props loaded yet or if scans already gotten
		if (this.props.id == null || this.props.user == null || this.state.scans != null || this.props.bearer === '') {
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
			
				axios.get('http://localhost:1234/maps/user/' + userId.toString(), headers)
					.then(res => {
						const mapData = res.data;
						
						if (mapData.length > 0 ) {
							this.setState({selectedMap: mapData[0]._id});
						}
						
						var maps = [];
						for (var i = 0; i < mapData.length;i++) {
							if (!mapData.type) {
								maps.push(mapData[i]);
							}
						}
						
						this.setState({ maps: maps });	
						this.setState({scans: scans});
					})
					.catch(error => {});
						
					})
			.catch(error => {
				
				
			});
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
	
	
	renderSelectedMap() {
		if (this.state.scans == null || this.state.maps == null || this.state.selectedMap === "") {
			return;
		}
		
		var map;
		
		for (var i = 0; i < this.state.maps.length;i++) {
			if (this.state.maps[i]._id == this.state.selectedMap) {
				map = this.state.maps[i];
			}
		}
		console.log(map);
		if (map) {
			console.log('in map render');
			return (
				<Map
					
					title={map.name}
					center={this.getMapCenter(map)}
					geometry={map.shape}
				
				/>
			);
		}
		
		
	}
	
	
	
	onMapSelected(event) {
		this.setState({selectedMap: event.target.value});
	}
	
	
	
	renderMapSelect() {
		if (this.state.maps == null) {
			return (<div></div>);
		}
		
		var options = [];
		for (var i = 0; i < this.state.maps.length;i++) {
			options.push(<MenuItem value={this.state.maps[i]._id}>{this.state.maps[i].name}</MenuItem>);
		}
		
		return options;
	}



	render() {
	
		var containerStyle = {
			'width': '100%',
			'height': '100%'
		};
		
		var map = this.renderSelectedMap();
		var selectOptions = this.renderMapSelect();

		return (
			<div style={containerStyle}>
			
				
			
				<Paper style={{'padding': '10px'}} elevation={4}>
					<h2>Your Maps</h2>
					
					{this.state.maps != null &&
					<form>
					<FormControl>
					<InputLabel htmlFor="map-select">Select Map</InputLabel>
					<Select
						value={this.state.selectedMap}
						onChange={this.onMapSelected}
						inputProps={{
							name: 'selectedMap',
							id: 'map-select',
						}}
					>
					{selectOptions}
					</Select>
					</FormControl>
					</form>
				}
					
					{map}
				</Paper>

			</div>
		);
	}
}

export default withRouter(MapSelector);
