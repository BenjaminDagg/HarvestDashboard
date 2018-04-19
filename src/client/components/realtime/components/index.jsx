import React from 'react';
import { withRouter } from 'react-router';

import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:1234');
var moment = require('moment');
import axios from 'axios';
import { withStyles } from 'material-ui/styles';





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
			]
			
		};
		
		this.drawScanList = this.drawScanList.bind(this);
		this.scanListener = this.scanListener.bind(this);
		this.getUserScans = this.getUserScans.bind(this);
		
		//listen for scans being added
		this.scanListener((err, message) => {

			for (var i = 0; i < this.state.scans;i++) {
				if (this.state.scans[i]._id == message._id) {
					return;
				}
			}

			console.log('got scan');
			//add new scan to scans array
			var scans = this.state.scans;
			
			//move all elements down one
			for (var i = scans.length; i > 0;i--) {
				scans[i] = scans[i-1];
			}
			
			
			var newScan = message;
			scans[0] = newScan;
			this.setState({scans: scans});
 			this.setState({message: message.datetime});
 		});
		
		
	}
	

	componentDidMount() {
 	
 		this.getUserScans();
    
  	}
  	
  	
  	//before component loaded get all of users scans
  	//as a base line so the table isnt empty
  	//gets 10 newest scans from user
  	getUserScans() {
  	
  		if (this.props.user == null || this.state.scans.length >= 2 || this.state.scans.length == 10) {
  			return;
  		}
  	
  		console.log(' in get');
		//get users scans from database
		var headers = {
            'Content-Type': 'application/json',
            'Authorization' : 'bearer' + this.props.bearer.toString()
        };
        console.log('here');
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
			this.setState({scans: scans.slice(0,10)});
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
  	
  	

	render() {
	
	this.getUserScans();
	
 	
 	//get rows of scan table
 	var rows = this.drawScanList();
		
	return (
    	<div>
    		<table>
    			<tr>
    				<td>Scan id</td>
    				<td>Date</td>
    				<td>User ID</td>
    			</tr>
    			{this.state.scans.map((value, index ) => {
  					
  					return (<tr key={index}>
  						<td>{value._id}</td>
  						<td>{value.datetime}</td>
  						<td>{value.profileId}</td>
  						</tr>
  					);
  				})
  				}
    		</table>
    	</div>
    );
		
    };
 
    
	
}

export default RealTime;
