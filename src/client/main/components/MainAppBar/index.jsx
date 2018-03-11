import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import AccountMenu from '../AccountMenu';
import styles from './styles';
import { Link } from 'react-router';

class MainAppBar extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <AppBar className={ classes.root } color="default">
        <Toolbar className={ classes.toolbar } >
          <div>
            <Typography variant="title" color="inherit" noWrap>
              Dashboard
            </Typography>
          </div>

          <div className={ classes.rightJustified }>
           
            <AccountMenu isLoggedIn={this.props.isLoggedIn} />
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
