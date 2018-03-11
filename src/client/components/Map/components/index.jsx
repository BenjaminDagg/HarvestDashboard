import React from 'react';
import { withRouter } from 'react-router';

import styles from './styles';

import { withStyles } from 'material-ui/styles';

/*
* Displays a Leaflet map with additional map data

  Props:
  	center : center coordinates of map ([lat,lng] [float,float])
  	markers: array of coordinates representing marker locations
  	shape: array of coordinates representing a shape (point, line, polygon)
  	title: title of map displayed over map
  	width
  	height
*/



class Map extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			map: null
		};
	}

	componentDidMount() {
 	
 	const lat = this.props.center[0];
 	const lng = this.props.center[1];
 	console.log('lat = ' + lat + ' lng = ' + lng);
    this.map = L.map(this.props.title.toString()).setView([lat,lng] , 2);
   	
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg', {
      maxZoom: 18,
      id: 'mapbox.streets-satellite',
      accessToken: 'pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg'
    }).addTo(this.map);
    
    
  }

	render() {
	
		var style = {
			map: {
    			height: '300px'
    		
  			}
		};
	
		return (
			<div>
				<h1>{this.props.title}</h1>
				
				<div id={this.props.title} style={{height: '300px', width: '300px'}}>
			
				</div>
			</div>
		);
	}
}

export default Map;
