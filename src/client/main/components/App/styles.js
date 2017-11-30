/**
 * The style for the root application screen component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
const styles = (theme) => ({
  root: {
    width: '100%',
    height: '100%',
    marginTop: theme.spacing.unit * 0,
    zIndex: 1,
    overflow: 'hidden'
  },
  appFrame: {
    position: 'absolute',
    display: 'flex',
    width: '100%',
    height: 'calc(100% - 48px)'
  }
});

export default styles;
