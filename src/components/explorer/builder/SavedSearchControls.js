import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import QueryPickerLoadUserSearchesDialog from './QueryPickerLoadUserSearchesDialog';


const SavedSearchControls = (props) => {
  const { onLoadSearches, onDeleteSearch, savedSearches,
    submitting, setQueryFormChildDialogOpen } = props;
  return (
    <div className="saved-search-controls-wrapper">
      <QueryPickerLoadUserSearchesDialog
        onLoadSearches={onLoadSearches}
        onDeleteSearch={onDeleteSearch}
        searches={savedSearches}
        submitting={submitting}
        setQueryFormChildDialogOpen={setQueryFormChildDialogOpen}
      />
    </div>
  );
};

SavedSearchControls.propTypes = {
  // from parent
  submitting: PropTypes.bool,
  updateQuery: PropTypes.func,
  onSubmit: PropTypes.func,
  pristine: PropTypes.bool,
  setQueryFormChildDialogOpen: PropTypes.func.isRequired,
  searchNickname: PropTypes.string.isRequired,
  savedSearches: PropTypes.array,
  onSaveSearch: PropTypes.func.isRequired,
  onLoadSearches: PropTypes.func.isRequired,
  onDeleteSearch: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
};


export default injectIntl(SavedSearchControls);
