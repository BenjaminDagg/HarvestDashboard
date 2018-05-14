import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Tabs, { Tab } from 'material-ui/Tabs';
import { Paper } from 'material-ui';
import Typography from 'material-ui/Typography';
import { Link, withRouter } from 'react-router';
import CrateStats from '../../CrateStats/components';
import TimeStats from '../../TimeStats/components';
import DistStats from '../../DistStats/components';

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


class HarvestStatistics extends React.Component {

  constructor(props) {
  	super(props);
  	
  	this.state = {
  		selector: 0
  	};
  	
  	//methods
  	this.handleSelectorChange = this.handleSelectorChange.bind(this);
  }
  
  
  
  
  //changed which view is diplayed when click on a tab
  handleSelectorChange(event,value) {
  	this.setState({selector: value});
  };
  
  
  
  
  render() {
  
    return (
      <div>
      	<div id="tabs">
      		{this.props.user != null && this.props.id != null &&
      			<Paper elevation={4}>
      			<Tabs value={this.state.selector} onChange={this.handleSelectorChange}>
        			<Tab label="Crates" />
        			<Tab label="Mean Time" />
        			<Tab label="Mean Distance" />
        			
        		</Tabs>
        		
        		{this.state.selector === 0 &&
        			<TabContainer>
        				<CrateStats
        					id={this.props.id}
        					user={this.props.user}
        					bearer={this.props.bearer}
        					/>
        			</TabContainer>
        		}
        		{this.state.selector === 1 &&
        			<TabContainer>
        					<TimeStats
        					id={this.props.id}
        					user={this.props.user}
        					bearer={this.props.bearer}
        					/>
        			</TabContainer>
        		}
        		{this.state.selector === 2 &&
        			<TabContainer>
        				<DistStats
        					id={this.props.id}
        					user={this.props.user}
        					bearer={this.props.bearer}
        					/>
        			</TabContainer>
        		}
      		</Paper>
      		}
      	</div>		
      </div>
    );
  }
}

HarvestStatistics.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withRouter(HarvestStatistics);
