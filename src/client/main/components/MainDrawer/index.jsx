import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Home from 'material-ui-icons/Home';
import Schedule from 'material-ui-icons/Schedule';
import Web from 'material-ui-icons/Web';
import Map from 'material-ui-icons/Map';
import Settings from 'material-ui-icons/Settings';
import styles from './styles';
import { createToggleIcon } from './util';


class MainDrawer extends React.Component {

  render() {
    const { classes } = this.props;
    const toggleIcon = createToggleIcon(this.props.theme.direction, this.props.open);

    return (
      <Drawer
        type="permanent"
        classes={{
          paper: classNames(classes.drawerPaper, !this.props.open && classes.drawerPaperClose)
        }}
        open={ this.props.open }
      >
        <div className={ classes.drawerMenu } >
          <List>
            <ListItem button divider className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="HOME" />
            </ListItem>

            <ListItem button  className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Schedule />
              </ListItemIcon>
              <ListItemText primary="REAL-TIME" />
            </ListItem>

            <ListItem button  className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Map />
              </ListItemIcon>
              <ListItemText primary="MAPS" />
            </ListItem>

            <ListItem button className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Web />
              </ListItemIcon>
              <ListItemText primary="HARVESTS" />
            </ListItem>
          </List>
        </div>

        <div className={ classes.drawerSettings } >
          <List>
            <Divider />
            <ListItem button divider className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="ADMIN" />
            </ListItem>

            <ListItem button disableRipple
              className={
                classNames(
                  classes.menuItem,
                  classes.menuItemHover,
                  classes.toggle,
                  this.props.open && classes.toggleOpen
                )
              }
              onClick={ this.props.onHandleDrawerToggle }
            >
              <ListItemIcon>
                { toggleIcon }
              </ListItemIcon>
            </ListItem>
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
