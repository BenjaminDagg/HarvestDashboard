import React from 'react';
import { Link, withRouter } from 'react-router';
import axios from 'axios';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Map from '../../Map/components';
import GuageChart from '../../GuageChart/components';
import { LinearProgress } from 'material-ui/Progress';
import Fade from 'material-ui/transitions/Fade';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import { InputLabel } from 'material-ui/Input';


var moment = require('moment');

class FieldMapsSelector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			maps: null, //array of map objects of the users maps
			user: this.props.user || null,
			bearer: this.props.bearer || null,
			fields: null, //array of map object of users fields
			isLoading: true,
			selectedField: null	//field object of currently seleccted field in the dropdown
		};

		this.onFieldChanged = this.onFieldChanged.bind(this);
		this.renderSelectedField = this.renderSelectedField.bind(this);
		this.renderFieldSelect = this.renderFieldSelect.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);
		this.getUserFields = this.getUserFields.bind(this);
	}

	
	/*
	Gets location to mmake iniitial coordinates of map 
	*/
	getMapCenter(geometry) {
		if (geometry.type == 'GeometryCollection') {
			return geometry.geometries[0].coordinates[0];
		} else {
			return geometry.coordinates[0];
		}
	}

	//get map objects for users fields with GET /maps/fields
	getUserFields() {
		if (!this.props.id || this.state.fields != null || this.props.bearer == '') {
			return <div>Loading data...</div>;
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
			.get('http://localhost:1234/maps/fields?id=' + userId.toString(), {}, headers)
			.then(res => {
				

				var fields = res.data;
				
				if (fields.length > 0) {
					//send id of field to parent
					this.props.sendFieldToParent(fields[0]._id);
					this.setState({selectedField: fields[0]});
				}
				this.props.fields(fields);
				this.setState({ fields: res.data });
				this.setState({ isLoading: false });
			})
			.catch(error => {
				console.log(error);
			});
	}
	
	
	/* creates select filled with names of all of
	the users fields
	*/
	renderFieldSelect() {
		
		//user has no fields or field data not loaded
		if (this.state.selectedField == null || this.state.fields == null || this.state.fields.length == 0) {
			return (<div></div>);
		}
		
		var options = [];
		for (var i = 0; i < this.state.fields.length;i++) {
			options.push(<MenuItem value={this.state.fields[i]._id}>{this.state.fields[i].name}</MenuItem>);
		}
		
		return options;
	}
	
	
	
	/*
		Makes map of currently selected field
	*/
	renderSelectedField() {
		
		if (this.state.fields == null || this.state.fields.length == 0 ||
			  !this.state.selectedField) {
			
			return (<div>No fields found for this user</div>);
		}
		
		return (
			<Map
				title={this.state.selectedField.name}
				center={this.state.selectedField.shape.geometries[0].coordinates[0]}
				geometry={this.state.selectedField.shape}
				zoom={14}
			/>
		);
	}
	
	
	
	/*
	When value in field selct changes, set selectedField 
	to the selected value
	*/
	onFieldChanged(event) {
	   //get id fro select
		var id = event.target.value;
		
		
		//search state fields to get the one matching the id
		var field = null;
		for (var i = 0; i < this.state.fields.length;i++) {
			if (this.state.fields[i]._id == id) {
				
				field = this.state.fields[i];
			}
		}
		
		//callback to parent comonent (Home)
		//and pass it id of selected field
		this.props.sendFieldToParent(id);
		
		this.setState({selectedField: field});
		
	}

	render() {
		this.getUserFields();

		var error = {
			color: 'red'
		};

		var style = {
			width: '100%',
			height: '90%'
		};

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' }
		};

		var selectOptions = this.renderFieldSelect()
		var field = this.renderSelectedField();
		

		return (
			<div style={style}>
				<style>
					{'\
                .c3-line{\
                  fill:none;\
                }\
              '}
				</style>
				<style>
					{
						'\
                .c3-axis path, .c3-axis line {\
                  stroke-width: 1px;\
                  fill : none;\
                  stroke: #000;\
                }\
              '
					}
				</style>
				
				{this.state.selectedField != null && 
					<Select
					value={this.state.selectedField.name}
					onChange={this.onFieldChanged}
					inputProps={{
						name: 'selectedUnit',
						id: 'controlled-open-select',
					}}
				>
					{selectOptions}
				</Select>
				
				}
				{this.renderSelectedField()}
			</div>
		);
	}
}

export default withRouter(FieldMapsSelector);
