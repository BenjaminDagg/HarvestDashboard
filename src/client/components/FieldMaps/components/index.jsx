import React from 'react';
import { Link, withRouter } from 'react-router';
import axios from 'axios';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Map from '../../Map/components';

var moment = require('moment');

class FieldMaps extends React.Component {

	constructor(props) {
		super(props);
	
		
		this.state = {
			maps: null, //array of map objects of the users maps
			user: this.props.user || null,
			bearer: this.props.bearer || null,
			fields: null 	//array of map object of users fields
		};
		
		
		this.getMapCenter = this.getMapCenter.bind(this);
		this.getUserFields = this.getUserFields.bind(this);
		
	};
	
	componentDidMount() {
		
		//set scanEndDate to the current date
		var timeDate = moment().utc('-8:00').toISOString();
		this.setState({scanEndDate: timeDate.slice(0,16)});
	};
	
	
	
	
	getMapCenter(geometry) {
		
		if (geometry.type == 'GeometryCollection') {
			return geometry.geometries[0].coordinates[0];
		} else {
			return geometry.coordinates[0];
		}
		
	};
	
	
	
	//get map objects for users fields with GET /maps/fields
	getUserFields() {
		if (!this.props.id || this.state.fields != null || this.props.bearer == "") {
			return (<div>Loading data...</div>);
		}
		
		const userId = this.props.id;
		
		//get users scans from database
		var headers = {
            'Content-Type': 'application/json',
            'Authorization' : 'bearer' + this.props.bearer.toString()
        };
        
  
        axios.defaults.headers.Authorization = this.props.bearer;
       
        //make call to maps service api
        axios.get('http://localhost:1234/maps/fields?id=' + userId.toString(),
        	{ },
			headers
		).then(res => {
			console.log(res.data);
			this.setState({fields: res.data});
		})
		.catch(error => {
		console.log(error);
		
		});
	}
	
	
	

	render() {
		
		this.getUserFields();
		
		var error = {
			'color' : 'red',
		};
		
		
		var style = {
			'overflow-y': 'auto',
			 'height': '100%'
		};
		
		
		
		return (
		
		  
			
			<div style={style}>
				
				
				{this.state.fields != null &&
					this.state.fields.map((data) => {
						return (
							<Map title={data.name}
								 center={this.state.fields[0].shape.geometries[0].coordinates[0]}
								 geometry={data.shape}
							/>
						)
					})
				}
				
				
			</div>
			
		);
	}
}

export default withRouter(FieldMaps);
