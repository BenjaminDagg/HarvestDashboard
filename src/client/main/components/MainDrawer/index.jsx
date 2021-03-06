import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List from 'material-ui/List';
import Home from 'material-ui-icons/Home';
import Schedule from 'material-ui-icons/Schedule';
import Web from 'material-ui-icons/Web';
import Map from 'material-ui-icons/Map';
import Settings from 'material-ui-icons/Settings';
import ReactTooltip from 'react-tooltip';
import styles from './styles';
import { createToggleIcon } from './util';

import MenuItem from '../MenuItem';

import MapComponent from '../../../components/Map/components';


class MainDrawer extends React.Component {


  gotoMaps() {
  	window.location.assign("/map");
  };
  
  gotoLogin() {
  	window.location.assign("/login");
  };
  
  gotoAnalytics() {
  	window.location.assign("/analytics");
  };
  
  gotoRealTime() {
  	window.location.assign('/realtime');
  }
  
  
  gotoHome() {
  	window.location.assign("/home");
  };

  render() {
    const {
      classes,
      theme,
      open
    } = this.props;
    const toggleIcon = createToggleIcon(theme.direction, open);

    return (
      <Drawer
        variant="permanent"
        classes={{
          paper: classNames(classes.drawerPaper, !open && classes.drawerPaperClose)
        }}
        open={ open }
      >
        <ReactTooltip place="right" effect="solid" disable={open} delayShow={100} />
        <div className={ classes.drawerMenu } >
          <List className={ classes.menuList } >
            <MenuItem onClick={this.gotoHome.bind(this)} primary="HOME" data-tip="Home" divider >
              <Home />
            </MenuItem>

            <MenuItem onClick={this.gotoRealTime.bind(this)} primary="REAL-TIME" data-tip="Real-Time" >
              <Schedule />
            </MenuItem>

            <MenuItem onClick={this.gotoMaps.bind(this)} children={MapComponent} primary="MAPS" data-tip="Maps" >
              <Map />
             
            </MenuItem>

            <MenuItem onClick={this.gotoAnalytics.bind(this)} primary="ANALYTICS" data-tip="Analytics" >
              <Web />
            </MenuItem>
          </List>
        </div>

        <div className={ classes.drawerSettings } >
          <List className={ classes.menuList } >
            <Divider light />
            <MenuItem primary="ADMIN" data-tip="Admin" >
              <Settings />
            </MenuItem>

            <Divider light />
            <MenuItem
              disableRipple
              onClick={ this.props.onHandleDrawerToggle }
              className={ classNames(
                classes.toggle,
                open && classes.toggleOpen
              )}
            >
              { toggleIcon }
            </MenuItem>
          </List>
        </div>
      </Drawer>
    );
  }
}

MainDrawer.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onHandleDrawerToggle: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true})(MainDrawer);
