import React from 'react';
import { withRouter } from 'react-router';
import Divider from 'material-ui/Divider';

import styles from './styles';

import { withStyles } from 'material-ui/styles';
import { Grid, Paper } from 'material-ui';

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
			map: null,
			markers: []
		};

		this.drawGeometry = this.drawGeometry.bind(this);
		this.addMarker = this.addMarker.bind(this);
	}
	addMarker(e) {
		var marker = new L.marker(e.latlng, { title: e.latlng }).addTo(this.map);
		marker.bindTooltip(e.latlng.toString()).openTooltip();
	}

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
			//if geometry collection loop through the geometries
			//list and draw each object
			case 'GeometryCollection':
				for (var i = 0; i < geometry.geometries.length; i++) {
					const shape = geometry.geometries[i];
					this.drawGeometry(shape);
				}
				break;

			case 'Point':
				const coords = geometry.coordinates;

				//get lat and long form coord and make latlng object
				var latlng = {
					lat: coords[0],
					lng: coords[1]
				};

				//create marker for the point
				var marker = new L.marker(latlng, { title: '' }).addTo(this.map);
				L.circle(coords, { radius: 1, color: 'blue' }).addTo(this.map);

				//if the shape has a scan object make
				//a popup window to display scan info
				if (geometry.scan) {
					var popUp =
						'<span> id: ' +
						geometry.scan._id +
						'</h1><br /><span> date: ' +
						geometry.scan.datetime +
						'</span>';
					marker.bindPopup(popUp);
				}

				//add new marker to state markers list
				var tempMarkers = this.state.markers;
				tempMarkers.push(marker);
				this.setState({ markers: tempMarkers });

				if (this.props.fit != null && this.props.fit == true) {
					//fit map to show all markers
					var group = new L.featureGroup(this.state.markers);
					this.map.fitBounds(group.getBounds());
				}
				break;

			case 'Polygon':
				const polyCoords = geometry.coordinates;
				var polygon = L.polygon(polyCoords, { color: 'red' }).addTo(this.map);
				break;

			case 'Line':
				const lineCoords = geometry.coordinates;
				var polyLine = L.polyline(lineCoords, { color: 'red' }).addTo(this.map);

				break;

			default:
				return;
		}
	}

	componentDidMount() {
		const lat = this.props.center[0];
		const lng = this.props.center[1];
		
		var zoom = this.props.zoom != null ? this.props.zoom : 2;

		this.map = L.map(this.props.title).setView([lat, lng], zoom);

		L.tileLayer(
			'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg',
			{
				maxZoom: 20,
				id: 'mapbox.streets-satellite',
				accessToken: 'pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg'
			}
		).addTo(this.map);

		if (this.props.geometry != null) {
			this.drawGeometry(this.props.geometry);
			/*
    	var bounds = new L.LatLngBounds();
    	bounds.extend
    	*/
		}

		this.map.on('click', this.addMarker);
		this.map.on('zoomend', function(e) {
			console.log(e);
		});
	}

	render() {
		var style = {
			map: {
				height: '300px'
			}
		};

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' }
		};

		return (
			<Grid container spacing={24}>
				<Grid item xs>
					<Paper style={styles.Paper}>
						<h1>{this.props.title}</h1>
						<div id={this.props.title} style={{ height: '400px' }} />
					</Paper>
				</Grid>
			</Grid>
		);
	}
}

export default Map;
