import React from 'react';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import styles from './styles';

class MainAppBar extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <AppBar className={classNames(classes.appBar, this.props.open && classes.appBarShift)}>
        <Toolbar disableGutters={!this.props.open}>
          <IconButton
            color="contrast"
            aria-label="open drawer"
            onClick={this.props.handleDrawerOpen}
            className={classNames(classes.menuButton, this.props.open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography type="title" color="inherit" noWrap>
            Main Drawer
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MainAppBar);
