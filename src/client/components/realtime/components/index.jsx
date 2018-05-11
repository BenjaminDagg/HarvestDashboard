import React from 'react';
import { withRouter } from 'react-router';
import LiveGraph from '../../LiveGraph/components';
import openSocket from 'socket.io-client';
import GuageChart from '../../GuageChart/components';

var moment = require('moment');
import axios from 'axios';
import { withStyles } from 'material-ui/styles';

import style from './style.css';

var turf = require('@turf/turf');

//graphing stuff
import C3Chart from 'react-c3js';
import LineChart from 'react-c3js';
import 'c3/c3.css';

var lodash = require('lodash');



class RealTime extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			socket: openSocket('http://localhost:1234'),
			message: 'none',
			timerSpeed: 1000, //number of milliseconds in timer
			scans: [	//array of users scans
				{
					_id : '',
					profielId: '',
					datetime: '',
					mapIds: [],
					scannedValue: '',
					location: {}
				}
			],
			crateEstimateGraph : {	//graph data for crate estimate graph
				data : {
					x: 'x',
					xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
					columns: [	
						['x'],	//columns[0] is x axis (current date)
						['crates:']	//columns[1] is # of estimated crates
					]
				},
				axis: {	//format of grapg x and y axis
					y: {
				
						max: 0,	//max value of y ticks
						min: 0,	//min value of y ticks
						
						label: {
							text: '# Crates',
							position: 'outer-middle'
						},
						tick: {
							fit: false,
						}
					},
					x: {
						type: 'timeseries',
						localtime: true,
						tick: {
							culling: true,
							fit: true,
							format: '%Y-%m-%dT%H:%M:%S.%LZ'
						}
					}
				}
					
			},
			minNumCrates: 0, //maximum estimated num of crates
			maxNumCrates: 0, //min estimated num of crates
			avgTime: 1, //avg time to harvest 10 newest crates
			showCrateAmt: 10, //number of crates to show in the list
			dateNow: moment().utc('-8:00').toISOString(),
			fields: null, 	//array of map objects of users fields
			graphs: null	//guage graph objects for users fields
		};
		
		
		this.registerSocket = this.registerSocket.bind(this);
		this.scanListener = this.scanListener.bind(this);
		this.getUserScans = this.getUserScans.bind(this);
		this.incrShowCrateAmt = this.incrShowCrateAmt.bind(this);
		this.resetCrateChart = this.resetCrateChart.bind(this);
		this.tick = this.tick.bind(this);
		this.updateCrateEstimates = this.updateCrateEstimates.bind(this);
		this.speedChanged = this.speedChanged.bind(this);
		this.getUserFields = this.getUserFields.bind(this);
		this.renderField = this.renderField.bind(this);
		this.updateFieldProgress = this.updateFieldProgress.bind(this);
		
		
		//listen for scans being added from socket
		this.scanListener((err, message) => {
			
			//check if scan already in table
			for (var i = 0; i < this.state.scans;i++) {
				if (this.state.scans[i]._id == message._id) {
					return;
				}
			}

			
			//add new scan to scans array
			var scans = this.state.scans;
			
			//move all elements down one
			for (var i = scans.length - 1; i > 0;i--) {
				scans[i] = scans[i-1];
			}
			
			
			var newScan = message;
			scans[0] = newScan;
			
			//find time to harvest new scan
			//by comparing to prev newest date
			var d1 = new Date(scans[0].datetime);
			var d2 = new Date(scans[1].datetime);
			var diff = (d1 - d2) / 1000;
			scans[0].time = diff;
			
			//get distance between crates
			//get distance between crates
			var end;
			var start;
				
			if (scans[0].location.coordinates[0] instanceof Array) {
				end = scans[0].location.coordinates[0];
								
			}
			else {
				end = scans[0].location.coordinates;
								
			}
							
			if (scans[1].location.coordinates[0] instanceof Array) {
				start = scans[1].location.coordinates[0];
								
			}
			else {
				start = scans[1].location.coordinates;
								
			}
				
			var options = {
				units: 'miles'
			};
			var dist = turf.distance(end, start, options);
			dist *= 5280;
				
			scans[0].dist = dist;
			
			//update crate avg time
			var time = 0
			for (var i = 0; i < 10;i++) {
				time += this.state.scans[i].time;
			}
			
			
			
			this.setState({avgTime: time / 10});
			this.setState({scans: scans});
 			this.setState({message: message.datetime});
 			
 			this.updateFieldProgress();
 			
 		});
 		
 		
 		
		
		
	}
	

	componentDidMount() {
 	
 		//creates timer to increment every second
 		this.interval = setInterval(this.tick,this.state.timerSpeed);
 		
 		//when socket connects to server sends server the user id
 		var self = this;
 		this.state.socket.on('connect', function(data) {
 			self.state.socket.emit('register', {uid: self.props.user._id});
 		});
    
  	}
  	
  	
  	
  	componentDidUpdate(prevProps, prevState) {
  		if (this.state.timerSpeed != 1000) {
  			clearInterval(this.interval);
  			//creates timer to increment every second
 			this.interval = setInterval(this.tick,this.state.timerSpeed);
  		}
  	}
  	
  	
  	
  	componentWillUnMount() {
  	
  		//deletes timer
  		clearInterval(this.interval);
  		
  		this.state.socket.close();
  	}
  	
  	
  	registerSocket(cb) {
  		if (this.props.user) {
  			console.log('registering');
  			var self = this;
  			this.state.socket.on('connect', function(data) {
  				self.state.socket.emit('register', {uid: self.props.user._id});
  			});
  		}
  	}
  	
  	
  	
  	//called every second
  	//uses the current date and the avg time to 
  	//harvest a crate to update crateEstimate data with
  	//new estimate
  	updateCrateEstimates() {
  	
  		//check if scan data is loaded
  		if (this.state.avgTime >= 1 && this.state.scans.length > 0) {
  			
  			//midnight of otday
 			var midnight =  moment(this.state.dateNow).utc('-8:00').add(1,'days').endOf('day').toISOString();
 			
 			//estimated number of crates going to be harvested today
 			var secLeft = Math.floor((new Date(midnight) - new Date(this.state.dateNow)) / 1000);
 			
 			
 			//estimated # of crates
 			var numCrates = Math.ceil(secLeft / this.state.avgTime);
 			
 			//update crateEstimateData
 			var graph = this.state.crateEstimateGraph;
 			
 			
 			//shifts all indexes of current data down one
 			for (var i = 0; i < graph.data.columns.length;i++) {
 				graph.data.columns[i] = [graph.data.columns[i][0]].concat(graph.data.columns[i].slice(1).slice(-15));
 			}
 			
 			
 			var max = 0;
 			var min = graph.data.columns[1][0];
 			for (var i = 0; i < graph.data.columns[1].length;i++) {
 				if (graph.data.columns[1][i] > max) {
 					max = graph.data.columns[1][i];
 				}
 				if (graph.data.columns[1][i] < min) {
 					min = graph.data.columns[1][i];
 				}
 			}
 			graph.axis.y.max = max + 5;
 			graph.axis.y.min = 0;
 			
 			//add new data
 			graph.data.columns[0].push(this.state.dateNow);
 			graph.data.columns[1].push(numCrates);
 			this.setState({crateEstimateGraph: graph});
  		
  			
  		}
  	}
  	
  	
  	//called every second when setInterval timer increments
  	//updates datenow to current time
  	tick() {
  		this.setState({dateNow: moment().utc('-8:00').toISOString()});
  		
  		this.updateCrateEstimates();
  		
  	}
  	
  	
  	//before component loaded get all of users scans
  	//as a base line so the table isnt empty
  	//gets 10 newest scans from user
  	getUserScans() {
  	
  		if (this.props.user == null || this.state.scans.length >= 2 || this.state.scans.length == 10) {
  			return;
  		}
  	
  		
		//get users scans from database
		var headers = {
            'Content-Type': 'application/json',
            'Authorization' : 'bearer' + this.props.bearer.toString()
        };
       
        //const userId = this.props.user.data.user._id;
        const userId = this.props.user._id;
        console.log('userId = ' + userId);
       	var from = '2018-01-01T00:00:00Z';
       	var to = moment().utc('-8:00').toISOString().slice(0,16) + 'Z';
        
        axios.defaults.headers.Authorization = this.props.bearer;
       
        //make call to maps service api
        axios.get('http://localhost:1234/scans?from=' + from + '&to=' + to + '&id=' + userId.toString(),
        	{ },
			headers
		).then(res => {
		
		
			
			
			//parse scans from response JSON
			const scans = res.data;
			scans.sort(function (a,b) {
					return (a.datetime > b.datetime) ? -1 : ((a.datetime < b.datetime) ? 1 : 0);
			});
			
			
			
			
			
			//get time to harvest each scan
			var avg = this.state.avgTime;
			for (var i = 0; i < scans.length - 1;i++) {
				var d1 = new Date(scans[i].datetime);
				var d2 = new Date(scans[i + 1].datetime);
				var diff = (d1 - d2) / 1000;
				
				
				
				//get distance between crates
				var end;
				var start;
				
				if (scans[i].location.coordinates[0] instanceof Array) {
					end = scans[i].location.coordinates[0];
								
				}
				else {
					end = scans[i].location.coordinates;
								
				}
							
				if (scans[i + 1].location.coordinates[0] instanceof Array) {
					start = scans[i + 1].location.coordinates[0];
								
				}
				else {
					start = scans[i + 1].location.coordinates;
								
				}
				
				var options = {
					units: 'miles'
				};
				var dist = turf.distance(end, start, options);
				dist *= 5280;
				
				scans[i].dist = dist;
				
				if (i < 10) {
					avg += diff;
				}
				scans[i].time = diff;
			}
			
			this.setState({avgTime: avg / 10});
			this.setState({scans: scans});
		})
		.catch((error) => {
		
		});
		
			
  	}
  	
  	
  	
  	
  	
  	//listens to socket server to detect when a new scan is added to database
  	scanListener(cb) {
  		this.state.socket.on('scan_added', message => cb(null,message));
  	}
  	
  	
  	
  	//when 'show more' button clicked increment 
  	//showCrateAmt by 10 to show 10 more crates
  	incrShowCrateAmt() {
  		var currAmt = this.state.showCrateAmt;
  		var newAmt = currAmt + 10;
  		this.setState({showCrateAmt: newAmt});
  	}
  	
  	
  	
  	//resets showCrateAmt to 0
  	resetCrateChart() {
  		this.setState({showCrateAmt: 10});
  	}
  	
  	
  	speedChanged(event) {
  		console.log('changed');
  		this.setState({timerSpeed: event.target.value});
  	}
  	
  	
  	
  	//get map objects for users fields with GET /maps/fields
	getUserFields() {
		if (!this.props.user || this.state.fields != null || this.props.bearer == "") {
			return (<div>Loading data...</div>);
		}
		
		const userId = this.props.user._id;
		
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
			var fields = res.data;
			var graphs = [];
			for (var i = 0; i < fields.length;i++) {
			var percent = fields[i].data.percentHarvested * 100;
			percent = percent.toFixed(2);
			var newGraph = {
					data: {
						columns: [
							['data', percent]
						],
						type: 'gauge'
					},
					gauge: {
						label: {
							format: function(value, ration) {
								return value;
							},
							show:false
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
			this.setState({graphs: graphs});	
			this.setState({fields: res.data});
			
		})
		.catch(error => {
		console.log(error);
		
		});
	}
	
	
	//takes in newly added field and updates field progress %
	//if the crate coordinates fall into one of the users fields
	//coordinates
	updateFieldProgress() {
		
		if (this.state.fields == null || this.state.graphs == null) {
			return;
		}
		
		var graphs = this.state.graphs;
		var fields = this.state.fields;
		
		//loop over every field
		for (var i = 0; i < this.state.fields.length;i++) {
			//loop over each row of the field
			
			var distPerRow = {};
			
			for (var j = 0; j < this.state.fields[i].data.rows.length;j++) {
			
				//polygon representing perimeter of the row
				var row = turf.polygon([this.state.fields[i].data.rows[j].coordinates]);
				//array of points in this row
				var lines = [];
				
				//loop over every scan
				for (var k = 0; k < this.state.scans.length;k++) {
					//loop over every coordinate for the scan
					for (var n = 0; n < this.state.scans[k].location.coordinates.length;n++) {
						//point of scan coordinates
						var point = turf.point(this.state.scans[k].location.coordinates[n]);
					
						//check if scan is inside of row perimeter
						if (turf.booleanWithin(point,row)) {
							lines.push(point.geometry.coordinates);
						}
					}
				}
				
				//record total distance harvested in this row
				if (lines.length <= 1) {
					distPerRow[j] = lines.length;
				}
				else {
					var lineString = turf.lineString(lines);
					var rowDistance = turf.length(lineString, {units: 'feet'});
					distPerRow[j] = rowDistance;
				}
			}
			
			/*
			To get percent harvested multiply length harvested in each
			row times the width of a row then divide that by the total area of
			field;
			*/
			var percentHarvested = 0;
			for (var key in distPerRow) {
				
				var area = distPerRow[key] * this.state.fields[i].data.row_width;
				percentHarvested += area;
			}
			percentHarvested = percentHarvested / this.state.fields[i].data.area;
			
			
			//update graph
			
			var targetGraph = graphs[i];
			targetGraph.data.columns[0][1] = (percentHarvested * 100.00).toFixed(2);
			graphs[i] = targetGraph;
			
		
			fields[i].data.percentHarvested = percentHarvested;
			fields[i].distancePerRow = distPerRow;
		}
		this.setState({graphs: graphs});
		this.setState({fields:fields});
	}
  	
  	
  	renderField(graph) {
  		return (
  			<div>
  				<h3>{graph.name}</h3>
  				<span>Completed: {graph.data.columns[0][1]}%</span>
  				<br/>
  				<GuageChart color={graph.color} size={graph.size} data={graph.data} guage={graph.gauge} name={graph.name.replace(/\s/g, '')} />
  			</div>
  		);
  	}
  	

	render() {
	
	//makes page scrollable
	var style = {
			'overflow-y': 'auto',
			 'height': '90%'
	};
	
	this.getUserScans();
	this.getUserFields();
	
	var fieldGraphs;
	
	if (this.state.fields == null || this.state.graphs == null) {
		fieldGraphs = (<div>Loading..</div>);
	}
	else {
		fieldGraphs = lodash.map(this.state.graphs, this.renderField);
	}
		
	return (
	
    	<div style={style}>
    	
    	
    	<style>{"\
                .c3-line{\
                  fill:none;\
                }\
              "}</style>
              <style>{"\
                .c3-axis path, .c3-axis line {\
                  stroke-width: 1px;\
                  fill : none;\
                  stroke: #000;\
                }\
              "}</style>
    	
    		<h2>Live Scan Feed </h2>
    		<span>Avg crate harvest time: {this.state.avgTime.toFixed(2)} seconds</span>
    		<br />
    		{this.state.showCrateAmt > 10 &&
    			
    			<button onClick={this.resetCrateChart}>Reset</button>
    		}
    		<table  id="crateChart" style={{'border' : '1px solid black'}}>
    			<tr style={{'border' : '1px solidblack'}}>
    				<td>Scan id</td>
    				<td>Date</td>
    				<td>Time (sec)</td>
    				<td>Distance (ft)</td>
    			</tr>
    			{this.state.scans.slice(0,this.state.showCrateAmt).map((value, index ) => {
    			
    				
    				//make newly added scan green
  					if (index == 0) {
  						return (<tr style={{'background-color':'#4ef442', 'border' : '1px solid black'}} key={index}>
  						<td>{value._id}</td>
  						<td>{value.datetime}</td>
  						<td>{value.time}</td>
  						<td>{value.dist}</td>
  						</tr>
  						);
  					}
  					//make even indexes grey background
  					else if (index % 2 == 0) {
  					return (<tr style={{'background-color': '#bec1c4','border' : '1px solid black'}} key={index}>
  						<td>{value._id}</td>
  						<td>{value.datetime}</td>
  						<td>{value.time}</td>
  						<td>{value.dist}</td>
  						</tr>
  					);
  					}
  					//make odd indexes white background
  					else {
  						return (<tr style={{'border' : '1px solid black'}} key={index}>
  						<td>{value._id}</td>
  						<td>{value.datetime}</td>
  						<td>{value.time}</td>
  						<td>{value.dist}</td>
  						</tr>
  					);
  					}
  				})
  				}
    		</table>
    		<br />
    		<button onClick={this.incrShowCrateAmt}>Show More</button>
    	
    	
    		<br />
    		
    		<h2>Estimated # Crates Harvested Today</h2>
    		<input type="range" min="100" max="2000" value={this.state.timerSpeed} onChange={this.speedChanged} />
    		<LiveGraph data={this.state.crateEstimateGraph.data} axis={this.state.crateEstimateGraph.axis} name="crateEstimateGraph" />
    		<br />
    		<div id="field-progress">
    			<h2>Field Progress</h2>
    			{fieldGraphs}
    		</div>
    	</div>
    );
		
    };
 
    
	
}

export default RealTime;
