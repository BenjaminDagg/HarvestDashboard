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

    this.handleDrawerHide = this.handleDrawerHide.bind(this);
  }

  handleDrawerHide() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { content, classes } = this.props;

    const navBar = (
      <MainDrawer
        open={ this.state.open }
        onHandleDrawerClose={ this.handleDrawerClose }
        onHandleDrawerHide={ this.handleDrawerHide }
      />
    );

    const appBar = (
      <MainAppBar />
    );

    return (
      <MuiThemeProvider theme={theme}>
        <div className={ classes.root }>
          { appBar }
          
          <div className={ classes.appFrame }>
            { navBar }
            { content }
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
