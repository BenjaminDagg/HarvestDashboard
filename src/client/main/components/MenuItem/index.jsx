import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from 'material-ui/styles';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import styles from './styles';

class MenuItem extends React.Component {
  render() {
    const {
      classes,
      children,
      className,
      primary,
      ...other
    } = this.props;

    const text = (
      <ListItemText
        primary={ primary }
        classes={{
          primary: classes.menuItemText
        }}
      />
    );

    return (
      <ListItem 
        button 
        { ...other }
        className={ classNames(
          classes.menuItem,
          classes.menuItemHover,
          className,
          
        )}
      >
        <ListItemIcon>
          { children }
        </ListItemIcon>
        { primary && text }
      </ListItem>
    );
  }
}

MenuItem.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  primary: PropTypes.string,
  children: PropTypes.element.isRequired
};

export default withStyles(styles)(MenuItem);
