import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Chip from '@material-ui/core/Chip';
import messages from '../../../resources/messages';
import { trimToMaxLength } from '../../../lib/stringUtil';

const MAX_QUERY_LENGTH = 30;

/**
 */
const ActiveFilters = (props) => {
  const { focus, query, onRemoveFocus, onRemoveQuery } = props;
  let focusChip;
  let queryChip;
  if (focus) {
    focusChip = (
      <Chip
        style={{ border: '1px solid rgb(189,189,189)', display: 'inline-flex' }}
        onDelete={onRemoveFocus}
        label={`${props.intl.formatMessage(messages.focus)}: ${focus.name}`}
      />
    );
  }
  if (query) {
    queryChip = (
      <Chip
        style={{ border: '1px solid rgb(189,189,189)', display: 'inline-flex' }}
        onDelete={onRemoveQuery}
        label={`${props.intl.formatMessage(messages.query)}: ${trimToMaxLength(query, MAX_QUERY_LENGTH)}`}
      />
    );
  }
  return (
    <div className="active-filters">
      {queryChip} {focusChip}
    </div>
  );
};

ActiveFilters.propTypes = {
  // from parent
  focus: PropTypes.object,
  onRemoveFocus: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  query: PropTypes.string,
  onRemoveQuery: PropTypes.func.isRequired,
};

export default injectIntl(ActiveFilters);
