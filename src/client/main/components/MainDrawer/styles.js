const drawerWidth = 240;
/**
 * The style for the sidebar component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
const styles = (theme) => ({
  drawerPaper: {
    position: 'static',
    width: drawerWidth,
    height: '100%',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    boxShadow: '0 0px 3px 1px rgba(0, 0, 0, .1)',

    // Hides the scrollbar when the drawer opens
    overflowX: 'hidden'
  },
  drawerPaperClose: {
    width: 60,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  drawerInner: {
    height: '100%'
  },
  drawerIcon: {
    display: 'flex',
    marginLeft: '6px'
  },
  collapseList: {
    backgroundColor: theme.palette.background.default
  },
  collapseListOpen: {
    display: 'flex',
    justifyContent: 'flex-end'
  }
});

export default styles;
