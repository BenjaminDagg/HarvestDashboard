import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';

import Map from '../../Map/components';

class MapContainer extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			maps: null,
			user: this.props.user || null,
			scans: null,
			scanCoords: {
				shape: {
					type: "GeometryCollection",
					geometries: []
				}
			}
		};
		
		this.getMaps = this.getMaps.bind(this);
		this.getUserScans = this.getUserScans.bind(this);
	};
	
	componentDidMount() {
		
		
	};
	
	getMaps() {
		var headers = {
            'Content-Type': 'application/json'
        };
		
		//make HTTP request to account service API
		axios.get('http://localhost:1234/maps',
			headers
		).then(res => {
			console.log(res);
			const mapData = res.data;
			
			this.setState({maps: mapData});
			console.log(mapData);
		})
		.catch(error => {
			this.props.submit(false);
			console.log('error');
		});	
	};
	
	
	getUserScans() {
		
		//check if user props loaded yet or if scans already gotten
		if (this.props.user == null || this.state.scans != null) {
			return;
		}
		
		const userId = this.props.user.data.user._id;
		
		//get users scans from database
		var headers = {
            'Content-Type': 'application/json'
        };
        //make call to maps service api
        axios.get('http://localhost:1234/scans?id=' + userId.toString(),
			headers
		).then(res => {
		
			//parse scans from response JSON
			const scans = res.data;
			
			
			//get user maps from the scans
			var userMaps = new Array();
			
			var points = this.state.scanCoords;
			
			
			for (var i = 0; i < scans.length;i++) {
				
				const coords = scans[i].location.coordinates[0];
				const point = {
					type: 'Point',
					coordinates: coords
				};
				points.shape.geometries.push(point);
			}
			
			
			axios.get('http://localhost:1234/maps/user/' + userId.toString(),
			headers
			).then(res => {
						
				const mapData = res.data;
				this.setState({maps: mapData});
			})
			.catch(error => {
					this.props.submit(false);
					console.log('error');
			});
			
			
			this.setState({scanCoords: points});
			this.setState({scans:scans});
			console.log(this.state.scanCoords);
			
		})
		.catch(error => {
			this.props.submit(false);
			console.log('error');
		});	
		
	};

	render() {
		
		this.getUserScans();
		
		return (
		
			
			<div>
				{this.state.user != null && this.state.user }
				{
				this.state.scans != null &&
					<Map title={'Scan Locations'} 
					geometry={this.state.scanCoords.shape} 
					center={this.state.scans[0].location.coordinates[0]} />
				}
				
				{this.state.maps != null && 
					this.state.maps.map((data) => {
						return (
							
							<Map title={data.name} center={data.shape.coordinates[0]}/>
						)
					})
				}
			</div>
			
		);
	}
}

export default withRouter(MapContainer);
