import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios'
import C3Chart from 'react-c3js';
import LineChart from 'react-c3js';
import 'c3/c3.css';
import style from './style.css';


class Analytics extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			crateData: null,
			meanDistData: null,
			crateTimeData: null,
			selectedUnit: 'hour'
		};
		this.drawMeanDistGraph = this.drawMeanDistGraph.bind(this);
		this.getMeanDistData = this.getMeanDistData.bind(this);
		this.getMax = this.getMax.bind(this);
		this.getCrateDate = this.getCrateData.bind(this);
		this.drawCpdGraph = this.drawCpdGraph.bind(this);
		this.getCrateTimeData = this.getCrateTimeData.bind(this);
		this.drawMeanTimeGraph = this.drawMeanTimeGraph.bind(this);
		this.unitChanged = this.unitChanged.bind(this);
	};
	
	
	componentDidMount() {
		this.getCrateData();
		this.getMeanDistData();
		this.getCrateTimeData();
	}
	
	
	getCrateData() {
		if (this.props.bearer === "" || this.state.crateData != null) {
			return;
		}
	
		//get users scans from database
		var headers = {
            'Content-Type': 'application/json',
            'Authorization' : 'bearer' + this.props.bearer.toString()
        };
        
        axios.defaults.headers.Authorization = this.props.bearer;
		
		//make HTTP request to account service API
		axios.get('http://localhost:2000/harvest/numcrates/between?from=01092018&to=05202018&id=' + this.props.user.data.user._id, {
				"username": this.state.username,
				"password": this.state.password
			},
			headers
		).then(res => {
			var data = res.data;
			this.setState({crateData: data});
		})
		.catch(error => {
			if (error.response) {
				this.setState({error: true});
				this.props.submit(false);
			}
			
			
		});
	}
	
	
	getMax(values) {
		var max = 0;
		for (var key in values) {
			
			if(values[key] > max) {
				max = values[key];
			}
		}
		return max;
	};
	
	
	getMeanDistData() {
	
		if (this.props.bearer === "" || this.state.meanDistData != null || !this.props.user) {
			return;
		}
	
		//get users scans from database
		var headers = {
            'Content-Type': 'application/json',
            'Authorization' : 'bearer' + this.props.bearer.toString()
        };
        
        axios.defaults.headers.Authorization = this.props.bearer;
		
		//make HTTP request to account service API
		axios.get('http://localhost:2000/harvest/meandist?from=01092018&to=05202018&id=' + this.props.user.data.user._id, {
				"username": this.state.username,
				"password": this.state.password
			},
			headers
		).then(res => {
			var data = res.data;
			
			this.setState({meanDistData: data});
		})
		.catch(error => {
			if (error.response) {
				this.setState({error: true});
				this.props.submit(false);
			}
			
			
		});
	}
	
	
	drawMeanDistGraph() {
	
		if (this.props.bearer == "") {
			return (<div>You must be logged in to view analytics</div>);
		}
	
		if(this.state.meanDistData == null) {
			return (<div>Loading Data..</div>)
		}
		
		
		
		var distData = this.state.meanDistData.distance;
		var data = {
			x: 'x',
			columns: [
				['x'],
				['distance: ']
			]
		};
		for (var key in distData) {
			
			data.columns[0].push(distData[key].time_frame);
			data.columns[1].push(Math.round(parseFloat(distData[key].distance)));
		}
		
		var axis = {
			y: {
				label: {
					text: 'Distance (miles)',
					position: 'outer-middle'
				},
				tick: {
					
				}
			},
			x: {
				type: "category",
				tick: {
					
				},
				label: {
					text: 'Date',
					position: 'outer-center'
				}
			}
		};
		const size = {
			
			height: 500
		};
		
		
		return(<div>
				<h1>Crate Mean Distance</h1>
				<span>Mean Distance between crates: {this.state.meanDistData.meandist}</span>
				<C3Chart  axis={axis} size={size} id="meanDist" data={data} />
				
			  </div>)
	}
	
	
	drawCpdGraph() {
	
		if(this.state.crateData == null) {
			return (<div>Loading data</div>)
		}
		
		var crateData = this.state.crateData.cratesPerDay;
		
		
		var data = {
			x: 'x',
			xFormat: '%Y-%m-%d',
			columns: [
				['x'],
				['crates:']
			],
			selection: {
				draggable: true
			}
		};
		for (var key in crateData) {
			
			data.columns[0].push(key);
			data.columns[1].push(crateData[key]);
		}
		
		var axis = {
			y: {
				label: {
					text: '# Crates',
					position: 'outer-middle'
				},
				tick: {
					fit: true,
					max: this.getMax(crateData)
				}
			},
			x: {
				type: 'timeseries',
				localtime: true,
				tick: {
					fit: true,
					format: '%Y-%m-%d'
				},
				label: {
					text: 'Date',
					position: 'outer-center'
				}
			}
		};
		const size = {
			
			height: 500
		};
		
		var zoom = {
			enabled: true,
			extent: [1,100]
		};
		
		return(<div><h1>Crates Harvested Per Day</h1><C3Chart  zoom={zoom} axis={axis} size={size} id="chart" data={data} /></div>)
	
	}
	
	
	
	//calls harvest api to get data for time between each crate
	//then stores it in state
	getCrateTimeData() {
		
		if (this.props.bearer === "" || this.state.crateTimeData != null || !this.props.user) {
			return;
		}
		console.log('in');
		//set authorization headers
		var headers = {
            'Content-Type': 'application/json',
            'Authorization' : 'bearer' + this.props.bearer.toString()
        };
        
        axios.defaults.headers.Authorization = this.props.bearer;
        
        //call harvest api meantime api
        //set query parameters
        var from = '01012018';
        var to = '05012018';
        var uid = this.props.user.data.user._id
        var unit = this.state.selectedUnit;
        
        axios.get('http://localhost:2000/harvest/meantime?from=' + from + '&to=' + to + '&id=' + uid + '&unit=' + unit, {
				"username": this.state.username,
				"password": this.state.password
			},
			headers
		).then(res => {
			var data = res.data;
			this.setState({crateTimeData: data});
			
		})
		.catch(error => {
			if (error.response) {
				this.setState({error: true});
				this.props.submit(false);
			}
			
			
		});
		
	}
	
	
	
	drawMeanTimeGraph() {
		
		if (this.props.bearer == "") {
			return (<div>You must be logged in to view analytics</div>);
		}
	
		if(this.state.crateTimeData == null) {
			return (<div>Loading Data..</div>);
		}
		
		console.log('in drawMeanTimeGraph');
		
		var timeData = this.state.crateTimeData.times;
		var data = {
			x: 'x',
			columns: [
				['x'],
				['time: ']
			]
		};
		for (var key in timeData) {
			
			data.columns[0].push(timeData[key].time_frame);
			data.columns[1].push(Math.round(parseFloat(timeData[key].time)));
		}
		
		var axis = {
			y: {
				label: {
					text: 'time (' + this.state.selectedUnit + ')',
					position: 'outer-middle'
				},
				tick: {
					
				}
			},
			x: {
				type: "category",
				tick: {
					
				},
				label: {
					text: 'Date',
					position: 'outer-center'
				}
			}
		};
		const size = {
			
			height: 500
		};
		
		
		return(<div>
				<h1>Mean time between crates</h1>
				<span> mean time: {this.state.crateTimeData.meantime}</span>
				<C3Chart  axis={axis} size={size} id="meanDist" data={data} />
			  </div>)
	}
	
	
	unitChanged(event) {
		
		this.setState({crateTimeData: null});
		this.setState({selectedUnit: event.target.value});
		this.getCrateTimeData();
		
	}
	
	

	render() {
	
		this.getCrateDate();
		this.getMeanDistData();
		this.getCrateTimeData();
	    
	    const data = {
  			columns: [
    			['', 30, 200, 100, 400, 150, 250],
    			['', 50, 20, 10, 40, 15, 25]
  			]
  	
  			
		};
		
		const size = {
			width: 500,
			height: 500
		};
		
		const axis = {
			y: {
				label: {
					text: '# Crates',
					position: 'outer-middle'
				}
			},
			x: {
				label: {
					text: 'Date',
					position: 'outer-center'
				}
			}
		};
		
		var cpdGraph = this.drawCpdGraph();
		var meanDistGraph = this.drawMeanDistGraph();
		var meanTimeGraph = this.drawMeanTimeGraph();
		
		var style = {
			'overflow-y': 'auto',
			 'height': '80%'
		};
	
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
              
             
				<div id="cpdGraph">
					<input type="date" />
					{cpdGraph}
				</div>
				<div id="meanDist">
					{meanDistGraph}
				</div>
				
				<div id="meanTime">
					Select unit: <select onChange={this.unitChanged} value={this.state.selectedUnit}>
									<option value="hour">Hours</option>
									<option value="min">Minutes</option>
									
								</select>
					{meanTimeGraph}
				</div>
			</div>
		);
	}
}

export default withRouter(Analytics);