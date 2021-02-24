import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Container, Box, Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { fetchFeaturedCollectionList } from '../../../actions/sourceActions';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import DataCard from '../../common/DataCard';
import { ExploreButton } from '../../common/IconButton';

const localMessages = {
  mainTitle: { id: 'collection.popular.mainTitle', defaultMessage: 'Featured Collections' },
};

const FeaturedCollectionsContainer = (props) => {
  const { collections } = props;
  return (
    <Container maxWidth="lg">
      <div className="featured-collections-wrapper">
        <Grid item xs={12}>
          <h1>
            <FormattedMessage {...localMessages.mainTitle} />
          </h1>
        </Grid>
        <div className="featured-collections-list">
          <Grid container spacing={2}>
            {collections.map((c) => {
              const link = `collections/${c.tags_id}`;
              const actions = (
                <Grid container justify="flex-end">
                  <Box pb={2} px={2}>
                    <ExploreButton linkTo={link} />
                  </Box>
                </Grid>
              );
              return (
                <Grid item key={c.tags_id} lg={4} md={6} xs={12}>
                  <DataCard className="featured-collections-item" actions={actions}>
                    <Box px={2}>
                      <h2><Link to={link}>{c.label}</Link></h2>
                      <p><i>{c.tag_set_label}</i></p>
                      <p>{c.description}</p>
                    </Box>
                  </DataCard>
                </Grid>
              );
            })}
          </Grid>
        </div>
      </div>
    </Container>
  );
};

FeaturedCollectionsContainer.propTypes = {
  collections: PropTypes.array,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.featured.fetchStatus,
  collections: state.sources.collections.featured.list,
});

const fetchAsyncData = dispatch => dispatch(fetchFeaturedCollectionList());

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      FeaturedCollectionsContainer
    )
  )
);
