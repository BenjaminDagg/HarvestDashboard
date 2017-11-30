import React from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, withStyles } from 'material-ui/styles';
import theme from './theme';
import styles from './styles';
import MainAppBar from '../MainAppBar';
import MainDrawer from '../MainDrawer';

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.handleDrawerOpen = this.handleDrawerOpen.bind(this);
    this.handleDrawerClose = this.handleDrawerClose.bind(this);
  }

  handleDrawerOpen() {
    this.setState({ open: true });
  }

  handleDrawerClose() {
    this.setState({ open: false });
  }

  render() {
    const { content, sidebar, classes } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <div className={classes.appFrame}>
            <MainAppBar
              open={ this.state.open }
              handleDrawerOpen={ this.handleDrawerOpen }
            />
            <MainDrawer
              open={ this.state.open }
              handleDrawerClose={ this.handleDrawerClose }
            />
            { content }
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  content: PropTypes.element,
  sidebar: PropTypes.element
};

export default withStyles(styles, { withTheme: true })(App);
