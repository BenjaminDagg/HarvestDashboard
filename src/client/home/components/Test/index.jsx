import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import styles from './styles';

const position = [51.505, -0.09];
class Test extends React.Component {

  constructor() {
    super()
    this.state = {
      lat: 51.505,
      lng: -0.09,
      zoom: 13,
      map: null
    }
  }

  componentDidMount() {
    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets-satellite',
      accessToken: 'pk.eyJ1IjoiZWd1aWRvIiwiYSI6ImNqYzE2ZDUycjA1em0yeHBmN2Q0Z2VveHQifQ.WKx_h2jg4NwT2FcVXGHSdg'
    }).addTo(this.map);

    L.marker([51.5, -0.09]).addTo(this.map)
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup();
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={ classes.map } id="map">
      </div>
    );
  }
}

Test.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles, { withTheme: true })(Test);
