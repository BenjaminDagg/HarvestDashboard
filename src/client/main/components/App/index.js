import React from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, withStyles } from 'material-ui/styles';
import theme from './theme';
import styles from './styles';


class App extends React.Component {

  render() {
    const { main, sidebar, classes } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <div className={classes.appFrame}>
            { sidebar }
            { main }
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  main: PropTypes.element,
  sidebar: PropTypes.element
};

export default withStyles(styles, { withTheme: true })(App);
