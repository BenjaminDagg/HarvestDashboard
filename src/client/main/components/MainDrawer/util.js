import React from 'react';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';

/**
  * Creates a toggle icon for a drawer that opens and closes
  * depending on the direction of the screen.
  * @param {object} direction - The direction of the screen. A value
  * of 'rtl' is expected if the screen goes from righ to left.
  * @param {bool} open - A flag indicating whether the drawer is open.
  * @returns {element} Returns either a left or right icon.
*/
const createToggleIcon = function(direction, open) {
  let toggleIcon;

  if (direction === 'rtl') {
    toggleIcon = (open) ? <ChevronRightIcon /> : <ChevronLeftIcon />;
  } else {
    toggleIcon = (open) ? <ChevronLeftIcon /> : <ChevronRightIcon />;
  }

  return toggleIcon;
};

module.exports = {
  createToggleIcon
};
