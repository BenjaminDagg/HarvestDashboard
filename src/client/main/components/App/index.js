import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MuiThemeProvider, withStyles } from 'material-ui/styles';
import theme from './theme';
import styles from './styles';
import MainAppBar from '../MainAppBar';
import MainDrawer from '../MainDrawer';


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      isLoggedIn: false,
      user: null
    };

    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
    this.login = this.login.bind(this);
    this.signOut = this.signOut.bind(this);
  }
  
  
  componentDidMount() {
	  const status = localStorage.getItem('isLoggedIn');
	  if (status) {
		  this.setState({isLoggedIn: JSON.parse(status)});
	  }
	  const currUser = localStorage.getItem('user');
	  if(currUser) {
		  this.setState({user: currUser});
	  }
  }
  
  

  handleDrawerToggle() {
    this.setState({ open: !this.state.open });
  }
  
  login(res, usr) {
	  
	  this.setState({isLoggedIn: res, user: JSON.stringify(usr)});
	  localStorage.setItem('isLoggedIn', JSON.stringify(this.state.isLoggedIn));
	  localStorage.setItem('user', this.state.user);
	  var user = JSON.parse(this.state.user);
	  var id = user.data.user._id;
	  prompt('in main user = ' + JSON.stringify(id));
  };
  
  signOut() {
	  console.log('logout pressed');
	  this.setState({isLoggedIn: false});
	  localStorage.setItem('isLoggedIn', JSON.stringify(false));
  };

  render() {
	 /*
	  var children = React.Children.map(this.props.children, function(child) {
		  return React.cloneElement(child, {
			  onCompletion: this.state.isloggedIn
		  })
	  });
	  */
	  var children = React.cloneElement(this.props.children, {submit: this.login,
	  														  isLoggedIn: this.state.isLoggedIn,
	  														  user: JSON.parse(this.state.user)});
	  
    const { content, classes } = this.props;

    const navBar = (
      <MainDrawer
        className={ classNames(classes.sidebar, !this.state.open && classes.sidebarClose) }
        open={ this.state.open }
        onHandleDrawerToggle={ this.handleDrawerToggle }
      />
    );

    const appBar = (
      <MainAppBar signout={this.signOut} isLoggedIn={this.state.isLoggedIn}/>
    );

    return (
    	
      <MuiThemeProvider theme={ theme } >
        <div className={ classes.root } >
          { appBar }
          
          <div className={ classes.appFrame } >
            { navBar }

            <div className={ classes.content } >
              { content }
              
              
              login = {this.state.isLoggedIn.toString()}
              user = {this.state.user != null && this.state.user.toString()}
              
              {children}
            </div>
          </div>

        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object,
  content: PropTypes.element
};

export default withStyles(styles, { withTheme: true })(App);
