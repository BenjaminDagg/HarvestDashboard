import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import List from 'material-ui/List';
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
              <Web />
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
            onClick={ this.props.onHandleDrawerToggle }
          >
            <IconButton className={ classes.drawerIcon } >
              { toggleIcon }
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
  onHandleDrawerToggle: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true})(MainDrawer);
