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
guage: format of guage
name (string) : name of graph.  Must be unique so 2 graphs
arent  rendered to same div

*/


class GuageChart extends React.Component {

	constructor(props) {
		super(props);
		
		this.state = {
			chart: null	//graph object
		};
		
		this.renderChart = this.renderChart.bind(this);
		
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
  		Creates graph object and bind to 
  		the div in the render function
  	*/
  	renderChart() {
  	
  		//c3 not initialized
  		if (window == undefined) {
  			return;
  		}
  		//no props given
  		if (!this.props.data || !this.props.guage || !this.props.color || !this.props.size) {
  		console.log('missing data');
  			return;
  		}
  		console.log('rendering');
  		//initialize graph
  		var c3 = require('c3');
  		this.state.chart = c3.generate({
 				bindto: '#' + this.props.name,
 				data: this.props.data,
 				gauge: this.props.guage,
 				color: this.props.color,
 				size: this.props.size
 		});
 	
 		
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

export default GuageChart;
