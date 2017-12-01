/**
 * The style for the home screen component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
const styles = (theme) => ({
  content: {
    width: '100%',
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 24
  }
});

export default styles;
