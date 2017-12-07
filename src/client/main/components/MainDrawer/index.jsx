import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import Home from 'material-ui-icons/Home';
import Schedule from 'material-ui-icons/Schedule';
import Web from 'material-ui-icons/Web';
import Map from 'material-ui-icons/Map';
import Settings from 'material-ui-icons/Settings';
import styles from './styles';
import { createToggleIcon } from './util';


class MainDrawer extends React.Component {

  render() {
    const { classes, theme } = this.props;
    const toggleIcon = createToggleIcon(theme.direction, this.props.open);

    return (
      <Drawer
        type="permanent"
        classes={{
          paper: classNames(classes.drawerPaper, !this.props.open && classes.drawerPaperClose)
        }}
        open={ this.props.open }
      >
        <div className={ classes.drawerMenu } >
          <List className={ classes.menuList } >
            <ListItem button divider className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="HOME" classes={{ text: classes.menuItemText }} />
            </ListItem>

            <ListItem button  className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Schedule />
              </ListItemIcon>
              <ListItemText primary="REAL-TIME" classes={{ text: classes.menuItemText }} />
            </ListItem>

            <ListItem button  className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Map />
              </ListItemIcon>
              <ListItemText primary="MAPS" classes={{ text: classes.menuItemText }} />
            </ListItem>

            <ListItem button className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Web />
              </ListItemIcon>
              <ListItemText primary="HARVESTS" classes={{ text: classes.menuItemText }} />
            </ListItem>
          </List>
        </div>

        <div className={ classes.drawerSettings } >
          <List className={ classes.menuList } >
            <Divider />
            <ListItem button divider className={ classNames(classes.menuItem, classes.menuItemHover) } >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="ADMIN" classes={{ text: classes.menuItemText }} />
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
