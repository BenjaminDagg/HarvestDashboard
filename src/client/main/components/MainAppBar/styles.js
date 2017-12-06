/**
 * The style for the sidebar component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
 const styles = (theme) => ({
   root: {
     position: 'relative',
     zIndex: theme.zIndex.navDrawer + 1,
     boxShadow: '0 0px 3px 2px rgba(0, 0, 0, 0.2)'
   },
   toolbar: {
     paddingLeft: 15,
     paddingRight: 15
   },
   brandIcon: {
     width: 30,
     paddingRight: 15,
     paddingBottom: 10
   }
 });

 export default styles;
