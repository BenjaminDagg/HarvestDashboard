import React from 'react';
import { withRouter } from 'react-router';

import styles from './styles';

import { withStyles } from 'material-ui/styles';

/*
* Displays a Leaflet map with additional map data

  Props:
  	center : center coordinates of map ([lat,lng] [float,float])
  	markers: array of coordinates representing marker locations // <-------- not implemented yet
  	geometry: GeoJSON object with structure
  			  {
  			  	Shape: {
  			  		type: (GeometryCollection, Point, Polygon),
  			  		coordinates: [Float],
  			  	}
  			  }
  			  	
  	title: title of map displayed over map
  	width // not implemented
  	height //not implemented
*/



class Map extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			map: null
		};
		
		this.drawGeometry = this.drawGeometry.bind(this);
		this.addMarker = this.addMarker.bind(this);
	}
	;
	
	addMarker(e) {
		var marker = new L.marker(e.latlng, {title: e.latlng}).addTo(this.map);
		marker.bindTooltip(e.latlng.toString()).openTooltip();
	};
	
	
	
	/*
	* Takes in GeoJson object, parses coordinates and draws it on the map
	*	Paramaters:
			geometry (GeoJson object) :
				obj: {
					type (string, required) : type of Geojson object (GeometryCollection, Point, Polygon, Line)
					coordinates ([Float], required) : array of coordinates representing vertices on the shape. If polygon
											it will be [[Float,Float]] an array of float touples
	*				geometries ([GeoJson]) : Only used for GeometryCollection tpye. Is an array of other GeoJson shape objects
	
				}
				
	  Output:
	  		void
	  		displays object on map no return value
	*/
	drawGeometry(geometry) {
	
		switch (geometry.type) {
		
			case "GeometryCollection":
			
				for (var i = 0; i < geometry.geometries.length;i++) {
					const shape = geometry.geometries[i];
					this.drawGeometry(shape);
				}
				break;
				
			case 'Point':
				const coords = geometry.coordinates;
				L.circle(coords, {radius: 1, color: 'red'}).addTo(this.map);
				break;
				
			case 'Polygon':
				const polyCoords = geometry.coordinates;
				var polygon = L.polygon(polyCoords, {color: 'red'}).addTo(this.map);
				break;	
			
			case 'Line':
				const lineCoords = geometry.coordinates;
				var polyLine = L.polyline(lineCoords, {color: 'red'}).addTo(this.map);
				
				break;
				
			default:
				console.log('error drawing geometry');
				return;
		}
		
	};

	componentDidMount() {
 	
 	const lat = this.props.center[0];
 	const lng = this.props.center[1];
 	console.log('lat = ' + lat + ' lng = ' + lng);
    this.map = L.map(this.props.title).setView([lat,lng] , 2);
   	
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg', {
      maxZoom: 18,
      id: 'mapbox.streets-satellite',
      accessToken: 'pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg'
    }).addTo(this.map);
    
    if (this.props.geometry != null) {
    	this.drawGeometry(this.props.geometry);
    }
    
    this.map.on('click', this.addMarker);
    
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
