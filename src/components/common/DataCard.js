import PropTypes from 'prop-types';
import React from 'react';

import { Card, CardActions, CardContent } from '@material-ui/core';

/**
 * The primary unit of our interface. Any self-contained piece of a larger report page should
 * be inside of a DataCard.
 */
const DataCard = (props) => {
  const { children, className, actions } = props;
  return (
    <Card className={`${className || ''}`}>
      <CardContent>
        {children}
      </CardContent>
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

DataCard.propTypes = {
  // from parent
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  actions: PropTypes.object,
};

export default DataCard;
