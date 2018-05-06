import React from 'react';
import { withRouter } from 'react-router';

import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:1234');
var moment = require('moment');
import axios from 'axios';
import { withStyles } from 'material-ui/styles';

import style from './style.css';

var turf = require('@turf/turf');

//graphing stuff
import C3Chart from 'react-c3js';
import LineChart from 'react-c3js';
import 'c3/c3.css';


class RealTime extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			message: 'none',
			scans: [
				{
					_id : '',
					profielId: '',
					datetime: '',
					mapIds: [],
					scannedValue: '',
					location: {}
				}
			],
			crateEstimateData: {
			x: 'x',
			xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
			columns: [
				['x'],
				['crates:']
			]
		},
			avgTime: 1, //avg time to harvest 10 newest crates
			showCrateAmt: 10, //number of crates to show in the list
			dateNow: moment().utc('-8:00').toISOString()
		};
		
		this.drawScanList = this.drawScanList.bind(this);
		this.scanListener = this.scanListener.bind(this);
		this.getUserScans = this.getUserScans.bind(this);
		this.incrShowCrateAmt = this.incrShowCrateAmt.bind(this);
		this.resetCrateChart = this.resetCrateChart.bind(this);
		this.renderCrateEstimateGraph = this.renderCrateEstimateGraph.bind(this);
		this.tick = this.tick.bind(this);
		
		//listen for scans being added
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
			for (var i = scans.length; i > 0;i--) {
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
				time += this.state.crates[i].time;
			}
			this.setState({avgTime: time / 10});
			this.setState({scans: scans});
 			this.setState({message: message.datetime});
 		});
		
		
	}
	

	componentDidMount() {
 	
 		this.getUserScans();
 		
 		this.interval = setInterval(this.tick,1000);
    
  	}
  	
  	componentWillUnMount() {
  		clearInterval(this.interval);
  	}
  	
  	
  	tick() {
  		this.setState({dateNow: moment().utc('-8:00').toISOString()});
  		
  		if (this.state.avgTime >= 1 && this.state.scans.length > 0) {
  			
 			var midnight =  moment(this.state.dateNow).utc('-8:00').add(1,'days').endOf('day').toISOString();
 			//estimated number of crates going to be harvested today
 			var secLeft = Math.floor((new Date(midnight) - new Date(this.state.dateNow)) / 1000);
 			var numCrates = Math.ceil(secLeft / this.state.avgTime);
 			console.log(midnight);
 			
 			var currData = this.state.crateEstimateData;
 			
 			for (var i = 0; i < currData.columns.length;i++) {
 				currData.columns[i] = [currData.columns[i][0]].concat(currData.columns[i].slice(1).slice(-5));
 			}
 			
 			currData.columns[0].push(this.state.dateNow);
 			currData.columns[1].push(numCrates);
 			this.setState({crateEstimateData: currData});
  		}
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
       
        const userId = this.props.user.data.user._id;
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
  	
  	
  	//loops over array of scans and makes table rows 
  	//showing their date
  	drawScanList() {
  		
  		//loop over every scans
  		this.state.scans.map((value, index ) => {
  			
  			return (<tr key={index}>
  						<td>{value._id}</td>
  						<td>{value.datetime}</td>
  					</tr>
  			);
  		})
  	};
  	
  	
  	//listens to socket server to detect when a new scan is added to database
  	scanListener(cb) {
  		socket.on('scan_added', message => cb(null,message));
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
  	
  	
  	
  	renderCrateEstimateGraph() {
  	
  		if (this.state.scans.length < 3 || this.state.avgTime < 1|| this.state.crateEstimateData == null) {
  			return (<div>Loading...</div>);
  		}
  	
  		//today at midnight
 		var midnight = moment(this.state.dateNow).utc('-8:00').endOf('day').toISOString();
		//time left from now to midnight
 		var secLeft = Math.floor((new Date(midnight) - new Date(this.state.dateNow)) / 1000);
 		
 		//estimated number of crates going to be harvested today
 		var numCrates = Math.floor(secLeft / this.state.avgTime);
 		
 		
		var axis = {
			y: {
				label: {
					text: '# Crates',
					position: 'outer-middle'
				},
				tick: {
					fit: true,
					max: 100
				}
			},
			x: {
				type: 'timeseries',
				localtime: true,
				tick: {
					fit: true,
					format: '%Y-%m-%dT%H:%M:%S.%LZ'
				}
			}
		};
		var data = this.state.crateEstimateData;
		
		
		
		
		return (<div><C3Chart  axis={axis}  data={this.state.crateEstimateData} /></div>);
  	
  	}
  	

	render() {
	
	//makes page scrollable
	var style = {
			'overflow-y': 'auto',
			 'height': '80%'
	};
	
	this.getUserScans();
	
 	var crateEstimates = this.renderCrateEstimateGraph();
 	
		
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
    		{crateEstimates}
    	
    	</div>
    );
		
    };
 
    
	
}

export default RealTime;
