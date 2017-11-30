import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Dashboard from 'material-ui-icons/Dashboard';
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
          <div className={ classes.drawerHeader } />

          <IconButton
            className={ classNames(classes.drawerIcon)}
          >
            <Dashboard />
          </IconButton>
          <Divider />
          <IconButton
            className={ classNames(classes.drawerIcon)}
            onClick={ this.props.onHandleDrawerClose }
          >
            { theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
      </Drawer>
    );
  }
}

MainDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onHandleDrawerClose: PropTypes.func.isRequired,
  onHandleDrawerOpen: PropTypes.func
};

export default withStyles(styles, { withTheme: true})(MainDrawer);
