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
            <ListItem button divider >
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>

            <ListItem button >
              <ListItemIcon>
                <Schedule />
              </ListItemIcon>
              <ListItemText primary="Real-Time" />
            </ListItem>

            <ListItem button >
              <ListItemIcon>
                <Web />
              </ListItemIcon>
              <ListItemText primary="Harvests" />
            </ListItem>
          </List>
        </div>

        <div className={ classes.drawerSettings } >
          <List>
            <Divider />
            <ListItem button divider >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>

            <ListItem button disableRipple
              className={
                classNames(
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
