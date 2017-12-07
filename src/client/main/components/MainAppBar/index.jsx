import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Menu, { MenuItem } from 'material-ui/Menu';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import AccountMenu from '../AccountMenu';
import styles from './styles';
import profileImage from '../../../images/icons/strawberry.svg';

class MainAppBar extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <AppBar className={ classes.root } color="secondary" >
        <Toolbar className={ classes.toolbar } >
          <div>
            <Typography type="title" color="inherit" noWrap>
              Dashboard
            </Typography>
          </div>

          <div className={ classes.rightJustified }>
            <AccountMenu />
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

MainAppBar.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(MainAppBar);
