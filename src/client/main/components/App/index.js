import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MuiThemeProvider, withStyles } from 'material-ui/styles';
import theme from './theme';
import styles from './styles';
import MainAppBar from '../MainAppBar';
import MainDrawer from '../MainDrawer';
import { connect } from 'react-redux';
import { clearUser } from '../../../actions/loginAction';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      isLoggedIn: false,
      user: null,
      bearer: ''
    };

    this.handleDrawerToggle = this.handleDrawerToggle.bind(this);
    this.login = this.login.bind(this);
    this.signOut = this.signOut.bind(this);
  }

  componentWillMount() {
    this.login();
  }

  componentDidMount() {
    this.login();
    const status = localStorage.getItem('isLoggedIn');
    if (status) {
      this.setState({ isLoggedIn: JSON.parse(status) });
    }
    const currUser = localStorage.getItem('user');
    if (currUser) {
      this.setState({ user: currUser });
    }
    const bearer = localStorage.getItem('bearer');
    if (bearer) {
      this.setState({ bearer: bearer });
    }
  }

  handleDrawerToggle() {
    this.setState({ open: !this.state.open });
  }

  login() {
    if (this.props.isLoggedIn) {
      this.setState({ bearer: this.props.bearer });
      localStorage.setItem('bearer', this.props.bearer);
      this.setState({ isLoggedIn: this.props.isLoggedIn, user: JSON.stringify(this.props.user) });
      localStorage.setItem('isLoggedIn', JSON.stringify(this.state.isLoggedIn));
      localStorage.setItem('user', this.state.user);
    }
  }

  signOut() {
    console.log('logout pressed');
    this.setState({ user: null });
    this.setState({ isLoggedIn: false });
    this.setState({ bearer: '' });
    localStorage.setItem('bearer', null);
    localStorage.setItem('isLoggedIn', JSON.stringify('false'));
    localStorage.setItem('user', null);
    this.props.onClearUser();
    window.location.reload();
  }

  render() {
    var children = React.cloneElement(this.props.children, {
      user: JSON.parse(this.state.user),
      isLoggedIn: this.state.isLoggedIn,
      signout: this.signOut,
      bearer: this.state.bearer
    });

    const { content, classes } = this.props;

    const navBar = (
      <MainDrawer
        className={classNames(classes.sidebar, !this.state.open && classes.sidebarClose)}
        open={this.state.open}
        onHandleDrawerToggle={this.handleDrawerToggle}
        signout={this.signOut}
      />
    );

    const appBar = <MainAppBar signout={this.signOut.bind(this)} isLoggedIn={this.state.isLoggedIn} />;

    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          {appBar}

          <div className={classes.appFrame}>
            {navBar}

            <div className={classes.content}>
              {content}
              
              {children}
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object,
  content: PropTypes.element
};

const mapActionsToProps = {
  onClearUser: clearUser
};

const maptStateToProps = state => ({
  bearer: state.user.bearer,
  user: state.user.user,
  isLoggedIn: state.user.isLoggedIn,
  stateC: state
});

export default withStyles(styles, { withTheme: true })(connect(maptStateToProps, mapActionsToProps)(App));
