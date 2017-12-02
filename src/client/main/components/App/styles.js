/**
 * The style for the root application screen component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
const styles = (theme) => ({
  root: {
    width: '100%',
    height: '100%',
    zIndex: 1,
    overflow: 'hidden'
  },
  appFrame: {
    display: 'flex',
    width: '100%',
    height: 'calc(100% - 56px)'
  },
  content: {
    width: '100%',
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 24
  }
});

export default styles;
