import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import styles from './styles';
import axios from 'axios';

class Test extends React.Component {

  constructor() {
    super();
    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 13,
      map: null,
      mapData: null
    };
   this.getMapData = this.getMapData.bind(this);
  }
  
 
  getMapData() {
  
  var headers = {
            'Content-Type': 'application/json'
        };
		
		//make HTTP request to account service API
		axios.get('http://localhost:1234/maps',
			headers
		).then(res => {
			const coords = res.data[0].shape.coordinates[0];
			const lat = coords[0];
			const lng = coords[1];
			console.log('lat = ' + lat + ' lng = ' + lng);
			this.map.setView([lat,lng], 5);
		})
		.catch(error => {
			this.props.submit(false);
			console.log('error');
		});
	}
 
  
  onMapClick(e) {
  	L.marker(e.latlng).addTo(this.map)
    .bindPopup('I am a popup!')
    .openPopup();
  };

  componentDidMount() {
 	
 	
 	this.getMapData()
  
    this.map = L.map('map').setView([51.505, -0.09], 5);
    
    this.map.on('click', this.onMapClick.bind(this));
   
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg', {
      maxZoom: 18,
      id: 'mapbox.streets-satellite',
      accessToken: 'pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg'
    }).addTo(this.map);
    
  
	
	/*
    L.marker([51.5, -0.09]).addTo(this.map)
    .bindPopup('I am a popup!')
    .openPopup();
    */
  }

  render() {
    const { classes } = this.props;
	
    return (
      <div className={ classes.map } id="map"/>
    );
  }
}

Test.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Test);
