import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import styles from './styles';

class Home extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <main className={ classes.content }>
        <Typography type="body1">
          { 'Sorry. This content is not available at the moment...' }
        </Typography>
      </main>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Home);
