import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import styles from './styles';

class MainAppBar extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <AppBar className={ classes.appBar }>
        <Toolbar>
          <Typography type="title" color="inherit" noWrap>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

MainAppBar.propTypes = {
  classes: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(MainAppBar);