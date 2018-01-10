import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import styles from './styles';
import { AboveTheFoldOnlyServerRender } from "above-the-fold-only-server-render";
import Test from '../Test';

class Home extends React.Component {

  render() {
    const { classes } = this.props;

    return (
      <main className={ classes.root } >
        <AboveTheFoldOnlyServerRender skip={true}>
          <Test></Test>
        </AboveTheFoldOnlyServerRender>
      </main>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Home);
