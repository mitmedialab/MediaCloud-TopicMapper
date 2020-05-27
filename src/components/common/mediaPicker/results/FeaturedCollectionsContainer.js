import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../hocs/AsyncDataContainer';
import { fetchMediaPickerFeaturedCollections } from '../../../../actions/systemActions';
import CollectionResultsTable from './CollectionResultsTable';
import * as fetchConstants from '../../../../lib/fetchConstants';
import { TAG_SET_MC_ID } from '../../../../lib/tagUtil';
import LoadingSpinner from '../../LoadingSpinner';

const localMessages = {
  title: { id: 'system.mediaPicker.select.featured.title', defaultMessage: 'Featured Collections' },
};

const FeaturedCollectionsContainer = (props) => {
  const { fetchStatus, collections, onToggleSelected, viewOnly, selectedMediaQueryType } = props;
  const { formatMessage } = props.intl;
  if (fetchStatus !== fetchConstants.FETCH_SUCCEEDED) {
    return <LoadingSpinner />;
  }
  return (
    <CollectionResultsTable
      title={formatMessage(localMessages.title)}
      collections={collections}
      onToggleSelected={onToggleSelected}
      selectedMediaQueryType={selectedMediaQueryType}
      viewOnly={viewOnly}
    />
  );
};

FeaturedCollectionsContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  selectedMediaQueryType: PropTypes.number,
  // from store
  fetchStatus: PropTypes.string,
  collections: PropTypes.array,
  viewOnly: PropTypes.bool,
};

const mapStateToProps = state => ({
  fetchStatus: state.system.mediaPicker.featured.fetchStatus,
  selectedMediaQueryType: state.system.mediaPicker.selectMediaQuery ? state.system.mediaPicker.selectMediaQuery.args.type : 0,
  collections: state.system.mediaPicker.featured ? state.system.mediaPicker.featured.list : null,
});

const fetchAsyncData = dispatch => dispatch(fetchMediaPickerFeaturedCollections(TAG_SET_MC_ID));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      FeaturedCollectionsContainer
    )
  )
);
