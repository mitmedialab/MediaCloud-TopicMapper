import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import CollectionResultsTable from './CollectionResultsTable';
import MediaPickerSearchForm from '../MediaPickerSearchForm';
import { selectMediaPickerQueryArgs, fetchMediaPickerCollections } from '../../../../actions/systemActions';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import LoadingSpinner from '../../LoadingSpinner';
import { notEmptyString } from '../../../../lib/formValidators';

const localMessages = {
  title: { id: 'system.mediaPicker.collections.title', defaultMessage: 'Collections matching "{name}"' },
  hintText: { id: 'system.mediaPicker.collections.hint', defaultMessage: 'Search for collections by name' },
  noResults: { id: 'system.mediaPicker.collections.noResults', defaultMessage: 'No results. Try searching for issues like online news, health, blogs, conservative to see if we have collections made up of those types of sources.' },
};


const CollectionSearchResultsContainer = (props) => {
  const { selectedMediaQueryKeyword, selectedMediaQueryType, initCollections, collectionResults, updateMediaQuerySelection, onToggleSelected, fetchStatus, hintTextMsg } = props;
  const { formatMessage } = props.intl;
  let content = null;
  if (fetchStatus === FETCH_ONGOING) {
    // we have to do this here to show a loading spinner when first searching (and featured collections are showing)
    content = <LoadingSpinner />;
  } else if (collectionResults.list && selectedMediaQueryKeyword) {
    content = (
      <CollectionResultsTable
        title={formatMessage(localMessages.title, { name: selectedMediaQueryKeyword })}
        collections={collectionResults.list}
        onToggleSelected={onToggleSelected}
      />
    );
  } else if (initCollections) {
    content = initCollections;
  } else {
    content = <FormattedMessage {...localMessages.noResults} />;
  }
  return (
    <div>
      <MediaPickerSearchForm
        initValues={{ storedKeyword: { mediaKeyword: selectedMediaQueryKeyword } }}
        onSearch={val => updateMediaQuerySelection({ ...val, type: selectedMediaQueryType })}
        hintText={formatMessage(hintTextMsg || localMessages.hintText)}
      />
      {content}
    </div>
  );
};


CollectionSearchResultsContainer.propTypes = {
  // form compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  whichTagSet: PropTypes.array,
  hintTextMsg: PropTypes.object,
  // from state
  selectedMediaQueryKeyword: PropTypes.string,
  selectedMediaQueryType: PropTypes.number,
  collectionResults: PropTypes.object,
  initCollections: PropTypes.object,
  fetchStatus: PropTypes.string,
  updateMediaQuerySelection: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.collectionQueryResults.fetchStatus,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  collectionResults: state.system.mediaPicker.collectionQueryResults,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateMediaQuerySelection: (values) => {
    if (values && notEmptyString(values.mediaKeyword)) {
      dispatch(selectMediaPickerQueryArgs(values));
      dispatch(fetchMediaPickerCollections({ media_keyword: values.mediaKeyword, which_set: ownProps.whichTagSet, type: values.type }));
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    CollectionSearchResultsContainer
  )
);
