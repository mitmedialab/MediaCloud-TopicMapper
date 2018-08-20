import PropTypes from 'prop-types';
import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const LoadingSpinner = (props) => {
  const { size, padding } = props;
  const sizeToUse = ((size !== undefined) && (size !== null)) ? (size) : 30;
  const customStyle = (padding !== undefined) ? { padding } : null;
  return (
    <div className="loading-spinner" style={customStyle}>
      <CircularProgress size={sizeToUse} />
    </div>
  );
};

LoadingSpinner.propTypes = {
  padding: PropTypes.number,
  size: PropTypes.number, // in pixels
};

export default LoadingSpinner;
