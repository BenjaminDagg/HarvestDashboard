import { createMuiTheme } from 'material-ui/styles';
import green from 'material-ui/colors/green';
import lightGreen from 'material-ui/colors/lightGreen';
import red from 'material-ui/colors/red';

const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: lightGreen
  },
  error: red
});

export default theme;
