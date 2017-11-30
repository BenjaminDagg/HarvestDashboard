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
    this.handleDrawerHide = this.handleDrawerHide.bind(this);
  }

  handleDrawerOpen() {
    this.setState({ open: true });
  }

  handleDrawerClose() {
    this.setState({ open: false });
  }

  handleDrawerHide() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { content, classes } = this.props;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <div className={classes.appFrame}>
            <MainAppBar />
            <MainDrawer
              open={ this.state.open }
              onHandleDrawerClose={ this.handleDrawerClose }
              onHandleDrawerHide={ this.handleDrawerHide }
            />
            <div className={ classes.content } >
              { content }
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object,
  content: PropTypes.element.isRequired
};

export default withStyles(styles, { withTheme: true })(App);
