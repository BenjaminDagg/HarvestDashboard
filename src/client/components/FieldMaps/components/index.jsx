import React from 'react';
import { Link, withRouter } from 'react-router';
import axios from 'axios';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Map from '../../Map/components';
import GuageChart from '../../GuageChart/components';
import { LinearProgress } from 'material-ui/Progress';
import Fade from 'material-ui/transitions/Fade';

var moment = require('moment');

class FieldMaps extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			maps: null, //array of map objects of the users maps
			user: this.props.user || null,
			bearer: this.props.bearer || null,
			fields: null, //array of map object of users fields
			graphs: null,
			isLoading: true
		};
		
		this.completionEstimate = this.completionEstimate.bind(this);
		this.remainingCrates = this.remainingCrates.bind(this);
		this.getMapCenter = this.getMapCenter.bind(this);
		this.getUserFields = this.getUserFields.bind(this);
	}

	componentDidMount() {
		//set scanEndDate to the current date
		var timeDate = moment()
			.utc('-8:00')
			.toISOString();
		this.setState({ scanEndDate: timeDate.slice(0, 16) });
	}

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
				console.log(res.data);

				var fields = res.data;
				var graphs = [];
				for (var i = 0; i < fields.length; i++) {
					var percent = fields[i].data.percentHarvested * 100;
					percent = percent.toFixed(2);
					var newGraph = {
						data: {
							columns: [['data', percent]],
							type: 'gauge'
						},
						gauge: {
							label: {
								format: function(value, ration) {
									return value;
								},
								show: false
							},
							min: 0,
							max: 100,
							units: ' %',
							width: 39
						},
						color: {
							pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
							threshold: {
								unit: 'value',
								max: 200,
								values: [30, 60, 90, 100]
							}
						},
						size: {
							height: 180
						},
						name: fields[i].name
					};
					graphs.push(newGraph);
				}
				this.setState({ graphs: graphs });
				this.setState({ fields: res.data });
				this.setState({ isLoading: false });
			})
			.catch(error => {
				console.log(error);
			});
	}
	
	
	remainingCrates(index) {
		
		if (this.state.fields == null) {
			return 0;
		}
		
		var harvestedCrates = this.state.fields[index].scans.length;
		var percent = this.state.fields[index].data.percentHarvested;
		var remaining = Math.ceil(harvestedCrates / percent);
		
		return remaining;
	
	}
	
	
	
	completionEstimate(index) {
		if (this.state.fields == null) {
			return "";
		}
		
		//find date that first crate was harvested
		var field = this.state.fields[index];
		
		//sort by date ascending
		var scans = field.scans;
		
		scans.sort(function(a,b) {
			return (a.datetime < b.datetime) ? -1 : ((a.datetime > b.datetime) ? 1 : 0);
		});
		
		var startDate = scans[0].datetime;
		startDate = moment(startDate).utc('-8:00');
		
		var now = moment().utc('-8:00');
		
		var diff = now - startDate;
		var daysPassed = Math.ceil(diff / 86400000);
		
		//estimated date to completion is how many days passed / percent complete
		//whcih gives number of days left. Then add that to current date
		var percent = field.data.percentHarvested;
		var daysLeft = Math.ceil(daysPassed / percent);
		
		var completionDate = moment(moment().utc('-8:00')).utc('-8:00').add(daysLeft, 'd');
		
		
		
		return completionDate.toISOString().slice(0,10);
	}
	

	render() {
		this.getUserFields();

		var error = {
			color: 'red'
		};

		var style = {
			overflowY: 'auto',
			height: '90%'
		};

		const styles = {
			Paper: { padding: 20, marginTop: 10, marginBottom: 10, textAlign: 'center' }
		};

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
				{this.state.fields != null &&
					this.state.fields.length == 0 &&
					<div>
						<h3>No fields found for this user</h3>
					</div>
				
				}
				{this.state.fields != null &&
					this.state.fields.map((data, index) => {
						return (
							<div key={data.name}>
								<div style={styles.Paper}>
									<Fade
										style={styles}
										in={this.state.isLoading}
										style={{
											transitionDelay: this.state.isLoading ? '800ms' : '0ms'
										}}
										unmountOnExit
									>
										<LinearProgress />
									</Fade>
								</div>

								<Map
									title={data.name}
									center={this.state.fields[0].shape.geometries[0].coordinates[0]}
									geometry={data.shape}
									zoom={14}
								/>
								<br />
								<h2>Field Progress</h2>
								<span>Completion: {this.state.graphs[index].data.columns[0][1]} %</span>
								<br />
								<span>Crates Harvested: {this.state.fields[index].scans.length} crates</span>
								<br/>
								<span>Remaining Crates: {this.remainingCrates(index)} crates</span>
								<br />
								<span>Estimated Completion Date: {this.completionEstimate(index)}</span>
								<GuageChart
									color={this.state.graphs[index].color}
									size={this.state.graphs[index].size}
									data={this.state.graphs[index].data}
									guage={this.state.graphs[index].gauge}
									name={this.state.graphs[index].name.replace(/\s/g, '')}
								/>
							</div>
						);
					})}
			</div>
		);
	}
}

export default withRouter(FieldMaps);
