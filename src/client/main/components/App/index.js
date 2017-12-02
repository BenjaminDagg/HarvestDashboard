import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
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

    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
  }

  handleDrawerToggle() {
    this.setState({ open: !this.state.open });
  }

  render() {
    const { content, classes } = this.props;

    const navBar = (
      <MainDrawer
        className={ classNames(classes.sidebar, !this.state.open && classes.sidebarClose) }
        open={ this.state.open }
        onHandleDrawerToggle={ this.handleDrawerToggle }
      />
    );

    const appBar = (
      <MainAppBar />
    );

    return (
      <MuiThemeProvider theme={ theme } >
        <div className={ classes.root } >
          { appBar }

          <div className={ classes.appFrame } >
            { navBar }

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
