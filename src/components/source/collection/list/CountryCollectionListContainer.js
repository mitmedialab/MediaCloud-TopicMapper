import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../../common/AsyncContainer';
import { fetchCollectionList } from '../../../../actions/sourceActions';
import CollectionTable from './CollectionTable';
import { TAG_SET_ABYZ_GEO_COLLECTIONS } from '../../../../lib/tagUtil';

const CountryCollectionListContainer = (props) => {
  const { name, description, collections } = props;
  const collectionsByCountry = {};
  // collection parsing here - maybe move into reducer or back end
  collections.forEach((c) => {
    const countryCode = c.tag.slice(0, 7);
    const geoCollection = collections.filter(g => g.tag.slice(0, 7) === countryCode);
    collectionsByCountry[countryCode] = geoCollection;
  });
  return (
    <div className="country-collections-table">
      <CollectionTable
        collections={collectionsByCountry}
        title={name}
        description={description}
      />
    </div>
  );
};

CountryCollectionListContainer.propTypes = {
  // from state
  collections: PropTypes.array.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
  fetchStatus: PropTypes.string.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.all.fetchStatus,
  name: state.sources.collections.all.name,
  description: state.sources.collections.all.description,
  collections: state.sources.collections.all.collections,
});

const mapDispatchToProps = dispatch => ({
  asyncFetch: () => {
    dispatch(fetchCollectionList(TAG_SET_ABYZ_GEO_COLLECTIONS));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeAsyncContainer(
        CountryCollectionListContainer
      )
    )
  );
