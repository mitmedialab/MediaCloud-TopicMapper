import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import Stat from './Stat';

const StatBar = props => (
  <div className="stat-bar">
    <Grid container spacing={3}>
      {props.stats.map((stat, idx) => (
        <Grid item lg={props.columnWidth || 4} md={6} key={idx}>
          <Stat {...stat} />
        </Grid>
      ))}
    </Grid>
  </div>
);

StatBar.propTypes = {
  // from parent
  stats: PropTypes.array.isRequired,
  className: PropTypes.string,
  columnWidth: PropTypes.number,
  // from context
  intl: PropTypes.object.isRequired,
};

export default
injectIntl(
  StatBar
);
