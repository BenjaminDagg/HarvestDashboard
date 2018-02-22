/**
 * The style for the sidebar component.
 * @param {object} theme - A material-ui theme object.
 * @returns {object} A material-ui component sytle object.
 */
 const styles = (theme) => ({
   root: {
     position: 'relative',
     zIndex: theme.zIndex.drawer + 1,
     boxShadow: '0 0px 3px 2px rgba(0, 0, 0, 0.2)'
   },
   toolbar: {
     paddingLeft: 15,
     paddingRight: 15
   },
   rightJustified: {
     width: '100%',
     display: 'flex',
     justifyContent: 'flex-end'
   }
 });

 export default styles;
