/**
 * The style for the sidebar component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
 const styles = (theme) => ({
   appBar: {
     position: 'absolute',
     paddingLeft: '12px',
     zIndex: theme.zIndex.navDrawer + 1,
     transition: theme.transitions.create(['width', 'margin'], {
       easing: theme.transitions.easing.sharp,
       duration: theme.transitions.duration.leavingScreen
     }),
     boxShadow: '0 0px 3px 2px rgba(0, 0, 0, 0.2)'
   },
   menuButton: {
     marginLeft: 7,
     marginRight: 24
   },
   hide: {
     display: 'none'
   }
 });

 export default styles;
