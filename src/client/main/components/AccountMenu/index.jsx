import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { MenuItem, MenuList } from 'material-ui/Menu';
import Grow from 'material-ui/transitions/Grow';
import Paper from 'material-ui/Paper';
import { Manager, Target, Popper } from 'react-popper';
import ClickAwayListener from 'material-ui/utils/ClickAwayListener';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import styles from './styles';
import profileImage from '../../../images/icons/strawberry.svg';


class AccountMenu extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
    this.handleRequestSignout = this.handleRequestSignout.bind(this);
    this.handleRequestLogin = this.handleRequestLogin.bind(this);
  };

  handleClick() {
    this.setState({ open: !this.state.open });
  };

  handleRequestClose() {
    
    this.setState({ open: false });
	
  };
  
  handleRequestSignout() {
  	this.props.signout();
  	this.handleRequestClose();
  };
  
  handleRequestLogin() {
  	window.location.assign("/login");
  }
  
  handleRequestRegister() {
  	window.location.assign("/register");
  }
  
  

  render() {
    const { classes } = this.props;
    
    var menu;
    
    if (this.props.isLoggedIn == true) {
    	menu = (
    		<MenuList role="menu" >
                 <MenuItem onClick={ this.handleRequestClose }>Account Settings</MenuItem>
                 <MenuItem onClick={ this.handleRequestClose }>Notifications</MenuItem>
                 <MenuItem onClick={ this.handleRequestSignout}>Sign out</MenuItem>
             </MenuList>
        );
    }
    else {
    	menu = (
    		<MenuList role="menu">
    			<MenuItem onClick={this.handleRequestLogin}>Login</MenuItem>
    			<MenuItem onClick={this.handleRequestRegister}>Register</MenuItem>
    		</MenuList>
    	);
    }

    return (
      <div className={ classes.root } >
        <ClickAwayListener onClickAway={ this.handleRequestClose } >
          <Manager>
            <Target>
              <IconButton
                aria-owns={ this.state.open ? 'menu-list' : null }
                aria-haspopup="true"
                onClick={ this.handleClick }
              >
                <Avatar src={ profileImage } className={ classes.avatar }/>
              </IconButton>
            </Target>
            <Popper
              placement="bottom-end"
              eventsEnabled={ this.state.open }
              className={ classNames({ [classes.popperClose]: !this.state.open }) }
            >
              <Grow in={ this.state.open } id="menu-list" style={{ transformOrigin: '0 0 0' }} >
                <Paper>
                  {menu}
                </Paper>
              </Grow>
            </Popper>
          </Manager>
        </ClickAwayListener>
      </div>
    );
  }
}

AccountMenu.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(AccountMenu);
