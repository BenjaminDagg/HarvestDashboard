/**
 * The style for the sidebar component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
const styles = (theme) => ({
  menuItem: {
    transition: theme.transitions.create('', {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.complex
    })
  },
  menuItemHover: {
    '&:hover svg, &:hover h3': {
      color: theme.palette.primary[600]
    },
    transition: theme.transitions.create('', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.standard
    })
  },
  menuItemText: {
    color: theme.palette.grey[600],
    fontWeight: 600,
    justifyContent: 'center',
    whiteSpace: 'nowrap'
  }
});

export default styles;
