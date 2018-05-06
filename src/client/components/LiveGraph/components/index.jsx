import React from 'react';
import { withRouter } from 'react-router';


import { withStyles } from 'material-ui/styles';

import style from './style.css';



//graphing stuff
import C3Chart from 'react-c3js';
import LineChart from 'react-c3js';
import 'c3/c3.css';


/*
Component to take in graph data and render a
graph that updates in real time

props:
data (object) : c3 data object of the data you want to render
axis (object) : c3 axis object of how you want graph formatted
name (string) : name of graph.  Must be unique so 2 graphs
arent  rendered to same div

*/


class RealTime extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			chart: null	//graph object
		};
		
		this.renderChart = this.renderChart.bind(this);
		this.update = this.update.bind(this);
 	}
		
		
	
	

	componentDidMount() {
	
		//try to create graph if c3 is ready
 		if (window == undefined) {
 		
 		}
 		else {
 			this.renderChart();
 		} 
  	}
  	
  	
  	/*
  		Called whenever parent component 
  		passes in different props. Updates
  		graph with new data
  	*/
  	componentDidUpdate(prevProps, prevState) {
		
  		this.update();
  	}
  	
  	
  	
  	/*
  		Creates graph object and bind to 
  		the div in the render function
  	*/
  	renderChart() {
  	
  		//c3 not initialized
  		if (window == undefined) {
  			return;
  		}
  		//no props given
  		if (!this.props.data || !this.props.axis) {
  			return;
  		}
  		
  		//initialize graph
  		var c3 = require('c3');
  		this.state.chart = c3.generate({
 				bindto: '#' + this.props.name,
 				data: this.props.data,
 				axis: this.props.axis
 		});
 	
 		this.update();
  	}
  	
  	
  	
  	/*
  		Called when new data passed in by parent
  		appends new data to data array and 
  		find max and min
  	*/
  	update() {
  		if (this.state.chart) {
  			
  			//make new max and min y values
  			this.state.chart.internal.config.axis_y_max =  this.props.axis.y.max;
  			this.state.chart.internal.config.axis_y_min = this.props.axis.y.min;
  			this.state.chart.internal.config.axis_y_padding =  0;
  			
  			//append new data to graph data
  			this.state.chart.load({
  				columns: this.props.data.columns
  			});
  		
  		}
  	}
  	
  	
	/*
	Renders graph into fiv which has id of the name 
	prop passed in. Cant name 2 graphs same thing
	because will render to same div
	*/
	render() {
		
		return (
    		<div >
    		
    			<div id={this.props.name}>
    			</div>
    		</div>
    	);
		
    };
 
    
	
}

export default RealTime;
