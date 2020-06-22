import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { selectMediaPickerQueryArgs, fetchMediaPickerCollections, resetMediaPickerCollections } from '../../../../actions/systemActions';
import CollectionSearchResultsContainer from './CollectionSearchResultsContainer';
import { notEmptyString } from '../../../../lib/formValidators';
import { TAG_SET_ABYZ_GEO_COLLECTIONS } from '../../../../lib/tagUtil';

const localMessages = {
  title: { id: 'system.mediaPicker.collections.title', defaultMessage: 'Collections matching "{name}"' },
  countrySearchHintText: { id: 'system.mediaPicker.collections.countryHint', defaultMessage: 'Search curated collections of country & state sources' },
  noResults: { id: 'system.mediaPicker.collections.noResults', defaultMessage: 'No results. Try searching for issues like online news, health, blogs, conservative to see if we have collections made up of those types of sources.' },
};


class CountryCollectionSearchResultsContainer extends React.Component {
  updateMediaQuery(values) {
    const { updateMediaQuerySelection, selectedMediaQueryType } = this.props;
    const updatedQueryObj = { ...values, type: selectedMediaQueryType };
    updateMediaQuerySelection(updatedQueryObj);
  }

  render() {
    const { selectedMediaQueryType, selectedMediaQueryKeyword, collectionResults, onToggleSelected, fetchStatus, viewOnly } = this.props;
    return (
      <CollectionSearchResultsContainer
        fetchStatus={fetchStatus}
        whichTagSet={[TAG_SET_ABYZ_GEO_COLLECTIONS]}
        onToggleSelected={onToggleSelected}
        selectedMediaQueryType={selectedMediaQueryType}
        selectedMediaQueryKeyword={selectedMediaQueryKeyword}
        collectionResults={collectionResults}
        initValues={{ mediaKeyword: selectedMediaQueryKeyword }}
        onSearch={val => this.updateMediaQuery(val)}
        hintTextMsg={localMessages.countrySearchHintText}
        handleMediaConcurrency={this.props.handleMediaConcurrency}
        viewOnly={viewOnly}
      />
    );
  }
}

CountryCollectionSearchResultsContainer.propTypes = {
  // form compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  whichTagSet: PropTypes.number,
  handleMediaConcurrency: PropTypes.func.isRequired,
  // from dispatch
  updateMediaQuerySelection: PropTypes.func.isRequired,
  // from state
  selectedMediaQueryKeyword: PropTypes.string,
  selectedMediaQueryType: PropTypes.number,
  collectionResults: PropTypes.object,
  fetchStatus: PropTypes.string,
  viewOnly: PropTypes.bool,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.collectionQueryResults.fetchStatus,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  selectedMediaQueryKeyword: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.mediaKeyword : null,
  collectionResults: state.system.mediaPicker.collectionQueryResults,
});

const mapDispatchToProps = dispatch => ({
  updateMediaQuerySelection: (values) => {
    if (values && notEmptyString(values.mediaKeyword)) {
      dispatch(resetMediaPickerCollections());
      dispatch(selectMediaPickerQueryArgs(values));
      dispatch(fetchMediaPickerCollections({ media_keyword: values.mediaKeyword, which_set: TAG_SET_ABYZ_GEO_COLLECTIONS }));
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    CountryCollectionSearchResultsContainer
  )
);
