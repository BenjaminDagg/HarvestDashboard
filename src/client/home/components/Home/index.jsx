import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import styles from './styles';
import Test from '../Test';
import Tabs, { Tab } from 'material-ui/Tabs';
import { Paper } from 'material-ui';
import Typography from 'material-ui/Typography';
import  FieldMapsSelector  from '../../../components/FieldMapsSelector/components';
import Scans from '../../../components/Scans/components';
import FieldStats from '../../../components/FieldStats/components';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};


class Home extends React.Component {

  constructor(props) {
  	super(props);
  	
  	this.state = {
  		mapValue: 0, //determines which view is shown in maps container 
  		selectedFieldId: ''	//id of field in FieldSeectorComonent to display stats about the field
  	};
  	
  	//methods
  	this.onFieldSelected = this.onFieldSelected.bind(this);
  	this.greeting = this.greeting.bind(this);
  	this.handleMapChange = this.handleMapChange.bind(this);
  }
  
  /*
  	Displays header greeting message 
  	If logged in shows username
  	If not logged in tells user to log in
  */
  greeting() {
  
  	//user is logged in
  	if (this.props.isLoggedIn && this.props.user) {
  		
  		return (<div>
  					<h1> Welcome, {this.props.user.username}</h1>
  					<span>Here is a summary of today's progress</span>
  				</div>
  		);
  	}
  	//user not logged in
  	else {
  		return (<div>
  					<h1> Welcome to Harvest Dashboard</h1>
  					<span> Please <a href='/login'>login</a> or <a href='/register'>register</a> to begin tracking your field</span>
  				</div>
  		);
  	}
  }
  
  
  getUserData() {
  	
  }
  
  
  
  //when click on tabs of maps container ('fields or 'maps')
  //changes value of mapValue to change which view is displayed
  handleMapChange(event,value) {
  	//update state of mapValue
  	this.setState({mapValue: value});
  };
  
  
  /*
  Callback used in mapselector component. When initial
  user field loads or the user selects a new field with 
  the select, passes the fields id back up to home component
  
  id : id of field that was selected
  */
  onFieldSelected(id) {
  	this.setState({selectedFieldId: id});
  }

  render() {
    const { classes } = this.props;
    
    var greeting = this.greeting();
    var greetingStyle = {
    	
    };
    
    //CSS for map-container
    var mapContainer = {
    	'width': '50%',
    	'height': '100px',
    	'position': 'relative',
    	'float': 'left'
    };
    
    var dashboardStyle = {
    	'width': '100%'
    	
    };
    
    var fieldStatsStyle = {
    	'height': '50%',
    	'width': '45%',
    	'position': 'relative',
    	'float': 'right',
    	'top': '-10px'
    };

    return (
      <main className={ classes.root } >
        {greeting}
        
      	{this.props.isLoggedIn == true && this.props.user &&
      		<div id="dashboard" style={dashboardStyle}>
      			<div id="map-container" style={mapContainer}>
      				<Paper elevation={4}>
      			 		<Tabs value={this.state.mapValue} onChange={this.handleMapChange}>
        					<Tab label="Fields" />
        					<Tab label="Maps" />
        				</Tabs>
        				{this.state.mapValue === 0 &&
        					<TabContainer>
        						<FieldMapsSelector 
        							sendFieldToParent={this.onFieldSelected}
        							showGraphs={"false"} 
        							user={this.props.user} 
        							bearer={this.props.bearer} 
        							id={this.props.user._id}/>
        					</TabContainer>
        				}
        				{this.state.mapValue === 1 &&
        					<TabContainer>
        						<Scans user={this.props.user} bearer={this.props.bearer} id={this.props.user._id} />
        					</TabContainer>
        				}
      				</Paper>
      			</div>
      			<div id="field-container" style={fieldStatsStyle}>
      				<FieldStats user={this.props.user} 
        						bearer={this.props.bearer} 
        						id={this.props.user._id}/>
      			</div>
      		</div>
      	
      	}
      </main>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Home);
