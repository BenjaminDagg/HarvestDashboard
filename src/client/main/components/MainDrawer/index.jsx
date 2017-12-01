import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Home from 'material-ui-icons/Home';
import Dashboard from 'material-ui-icons/Dashboard';
import Schedule from 'material-ui-icons/Schedule';
import Timeline from 'material-ui-icons/Timeline';
import Web from 'material-ui-icons/Web';
import Settings from 'material-ui-icons/Settings';
import WbSunny from 'material-ui-icons/WbSunny';
import styles from './styles';


class MainDrawer extends React.Component {

  render() {
    const { classes, theme } = this.props;

    return (
      <Drawer
        type="permanent"
        classes={{
          paper: classNames(classes.drawerPaper, !this.props.open && classes.drawerPaperClose)
        }}
        open={ this.props.open }
      >
        <div className={ classes.drawerInner } >
          <List>
            <IconButton
              className={ classes.drawerIcon}
            >
              <Home />
            </IconButton>
          </List>
          <Divider />

          <List>
            <IconButton className={ classes.drawerIcon } >
              <Schedule />
            </IconButton>

            <IconButton className={ classes.drawerIcon } >
              <Timeline />
            </IconButton>
          </List>
          <Divider />

          <List>
            <IconButton className={ classes.drawerIcon } >
              <Settings />
            </IconButton>
          </List>
          <Divider />

          <List
            className=
            {
              classNames(
                classes.collapseList,
                this.props.open && classes.collapseListOpen
              )
            }
            onClick={ this.props.onHandleDrawerHide }
          >
            <IconButton className={ classes.drawerIcon } >
              {
                (this.props.open && theme.direction === 'ltr') ?
                  <ChevronLeftIcon /> : <ChevronRightIcon />
              }
            </IconButton>
          </List>
          <Divider />
        </div>
      </Drawer>
    );
  }
}

MainDrawer.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onHandleDrawerClose: PropTypes.func,
  onHandleDrawerOpen: PropTypes.func,
  onHandleDrawerHide: PropTypes.func
};

export default withStyles(styles, { withTheme: true})(MainDrawer);
