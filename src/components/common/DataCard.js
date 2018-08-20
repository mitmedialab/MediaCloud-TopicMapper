import PropTypes from 'prop-types';
import React from 'react';

/**
 * The primary unit of our interface. Any self-contained piece of a larger report page should
 * be inside of a DataCard.
 */
const DataCard = (props) => {
  const { children, border, disabled, className, inline, leftBorder } = props;
  const unborderedClass = (border === false) ? 'unbordered' : '';
  const disabledClass = (disabled === true) ? 'disabled' : '';
  const leftBorderClass = (leftBorder === true) ? 'left-border' : '';
  const inlineClass = (inline === true) ? 'inline' : '';
  const rootClasses = `${unborderedClass} ${disabledClass}`;
  const classes = `datacard ${rootClasses} ${className} ${inlineClass} ${leftBorderClass}`;
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

DataCard.propTypes = {
  // from parent
  children: PropTypes.node.isRequired,
  border: PropTypes.bool,
  leftBorder: PropTypes.bool,
  disabled: PropTypes.bool,
  inline: PropTypes.bool,
  className: PropTypes.string,
};

export default DataCard;
