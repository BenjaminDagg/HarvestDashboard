const drawerWidth = 240;
/**
 * The style for the sidebar component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
const styles = (theme) => ({
  drawerPaper: {
    // The relative position allows rendering the drop shadow
    // when the content background color is changed
    position: 'relative',
    width: drawerWidth,
    height: '100%',
    boxShadow: '0 0px 3px 1px rgba(0, 0, 0, .1)',

    // Hide the scrollbar when the drawer opens
    overflowX: 'hidden',

    // Creates a transition when the drawer opens
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    width: 60,

    // Creates a transition when the drawer closes
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  drawerMenu: {
    height: '100%',
    // Makes the text in the sidebar not wrap
    width: drawerWidth
  },
  drawerSettings: {
    display: 'flex',
    direction: 'row',
    alignItems: 'flex-end'
  },
  toggle: {
    backgroundColor: theme.palette.background.default
  },
  toggleOpen: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
});

export default styles;
