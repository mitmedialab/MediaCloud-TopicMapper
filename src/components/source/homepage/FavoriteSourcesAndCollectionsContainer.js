import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import DataCard from '../../common/DataCard';
import { fetchFavoriteCollections, fetchFavoriteSources } from '../../../actions/sourceActions';
import composeAsyncContainer from '../../common/AsyncContainer';
import { ExploreButton } from '../../common/IconButton';
import { slugifyLocalCollectionPath, slugifyLocalSourcePath } from '../../../lib/urlUtil';

const NUMBER_TO_SHOW = 8; // how many of each to show

const localMessages = {
  mainTitle: { id: 'homepage.favorites.mainTitle', defaultMessage: 'My Starred Items' },
  seeAll: { id: 'homepage.favorites.seeAll', defaultMessage: 'see all your starred items' },
  noFavs: { id: 'homepage.favorites.none', defaultMessage: 'You don\'t have any starred items yet! When you star a source or collection it will show up here.' },
};

const FavoriteSourcesAndCollectionsContainer = (props) => {
  const { favoritedSources, favoritedCollections } = props;
  const { formatMessage } = props.intl;
  let favSourcesContent = null;
  let favCollectionsContent = null;
  // only show sources list if they have any
  if (favoritedSources && favoritedSources.length > 0) {
    favSourcesContent = (
      <ul className="fav-sources">
        { favoritedSources.slice(0, NUMBER_TO_SHOW).map(c =>
            (<li key={c.media_id} ><Link to={slugifyLocalSourcePath(c)}>{c.name}</Link></li>)
          )
        }
      </ul>
    );
  }
  // only show collections list if they have any
  if (favoritedCollections && favoritedCollections.length > 0) {
    favCollectionsContent = (
      <ul className="fav-collections">
        { favoritedCollections.slice(0, NUMBER_TO_SHOW).map(c =>
            (<li key={c.tags_id} ><Link to={slugifyLocalCollectionPath(c)}>{c.label}</Link></li>)
          )
      }
      </ul>
    );
  }
  let noFavsContent = null;
  if ((favoritedSources.length === 0) && (favoritedCollections.length === 0)) {
    noFavsContent = <FormattedMessage {...localMessages.noFavs} />;
  }
  return (
    <DataCard className="favorite-sources-collections">
      <div className="actions">
        <ExploreButton linkTo={'/favorites'} tooltip={formatMessage(localMessages.seeAll)} />
      </div>
      <h2>
        <FormattedMessage {...localMessages.mainTitle} />
      </h2>
      {noFavsContent}
      {favSourcesContent}
      {favCollectionsContent}
    </DataCard>
  );
};

FavoriteSourcesAndCollectionsContainer.propTypes = {
  fetchStatus: PropTypes.string.isRequired,
  favoritedSources: PropTypes.array.isRequired,
  favoritedCollections: PropTypes.array.isRequired,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.favorited.fetchStatus,
  favoritedSources: state.sources.sources.favorited.list,
  favoritedCollections: state.sources.collections.favorited.list,
});

const mapDispatchToProps = dispatch => ({
  fetchData: () => {
    dispatch(fetchFavoriteCollections());
    dispatch(fetchFavoriteSources());
  },
  asyncFetch: () => {
    dispatch(fetchFavoriteCollections());
    dispatch(fetchFavoriteSources());
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeAsyncContainer(
        FavoriteSourcesAndCollectionsContainer
      )
    )
  );
