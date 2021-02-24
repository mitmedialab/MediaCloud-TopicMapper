import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Container, Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import withAsyncData from '../../../common/hocs/AsyncDataContainer';
import CollectionIcon from '../../../common/icons/CollectionIcon';
import { fetchGeoCollectionsByCountry } from '../../../../actions/sourceActions';
import CollectionList from '../../../common/CollectionList';
import PageTitle from '../../../common/PageTitle';

const localMessages = {
  title: { id: 'sources.collections.geo.title', defaultMessage: 'Collections by Country' },
  description: { id: 'sources.collections.geo.description', defaultMessage: 'We have curated a set of collections by geography.  For each country below we have a national collection, which includes media sources that report about the whole country.  For many countries we also have state- or province-level collections, for media sources that are published in and focus on that part of the country.' },
};

const CountryCollectionListContainer = ({ collectionsByCountry, user, collectionSets }) => (
  <Container maxWidth="lg">
    <Grid container spacing={3}>
      <PageTitle value={localMessages.title} />
      <Grid item>
        <h1>
          <CollectionIcon height={32} />
          <FormattedMessage {...localMessages.title} />
        </h1>
        <p><FormattedMessage {...localMessages.description} /></p>
      </Grid>
      {collectionsByCountry.map((countryInfo, idx) => (
        <Grid item key={idx}>
          <CollectionList
            collectionSets={collectionSets}
            collections={countryInfo.collections}
            title={countryInfo.country && countryInfo.country.name ? countryInfo.country.name : ''}
            user={user}
            dataCard={false}
          />
        </Grid>
      ))}
    </Grid>
  </Container>
);

CountryCollectionListContainer.propTypes = {
  // from state
  fetchStatus: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  collectionsByCountry: PropTypes.array.isRequired,
  collectionSets: PropTypes.array.isRequired,
  // from context
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.geo.fetchStatus,
  user: state.user,
  collectionsByCountry: state.sources.collections.geo.list,
  collectionSets: state.system.staticTags.tagSets.collectionSets,
});

const fetchAsyncData = dispatch => dispatch(fetchGeoCollectionsByCountry());

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      CountryCollectionListContainer
    )
  )
);
