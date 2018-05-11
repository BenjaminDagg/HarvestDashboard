import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import styles from './styles';
import Test from '../Test';

class Home extends React.Component {

  constructor(props) {
  	super(props);
  	
  	this.greeting = this.greeting.bind(this);
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

  render() {
    const { classes } = this.props;
    
    var greeting = this.greeting();
    var greetingStyle = {
    	
    };

    return (
      <main className={ classes.root } >
        {greeting}
      </main>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Home);
