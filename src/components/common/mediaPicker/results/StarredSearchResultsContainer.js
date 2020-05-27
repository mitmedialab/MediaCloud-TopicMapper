import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import CollectionResultsTable from './CollectionResultsTable';
import SourceResultsTable from './SourceResultsTable';
import { FETCH_ONGOING } from '../../../../lib/fetchConstants';
import LoadingSpinner from '../../LoadingSpinner';

const localMessages = {
  collTitle: { id: 'system.mediaPicker.favorited.title', defaultMessage: 'My Starred Collections' },
  sourceTitle: { id: 'system.mediaPicker.favorited.title', defaultMessage: 'My Starred Sources' },
  hintText: { id: 'system.mediaPicker.favorited.hint', defaultMessage: 'Search for favorites' },
  noResults: { id: 'system.mediaPicker.favorited.noResults', defaultMessage: 'No results. Try searching for issues like online news, health, blogs, conservative to see if we have collections made up of those types of sources.' },
};


const StarredSearchResultsContainer = (props) => {
  const { favoritedCollections, favoritedSources, onToggleSelected, viewOnly, fetchStatus } = props;
  const { formatMessage } = props.intl;
  let content = null;
  if (fetchStatus === FETCH_ONGOING) {
    // we have to do this here to show a loading spinner when first searching (and featured collections are showing)
    content = <LoadingSpinner />;
  } else if (favoritedCollections && favoritedSources) {
    content = (
      <div>
        <CollectionResultsTable
          title={formatMessage(localMessages.collTitle, { name: '' })}
          collections={favoritedCollections}
          onToggleSelected={onToggleSelected}
          viewOnly={viewOnly}
        />
        <SourceResultsTable
          title={formatMessage(localMessages.sourceTitle, { name: '' })}
          sources={favoritedSources}
          onToggleSelected={onToggleSelected}
          viewOnly={viewOnly}
        />
      </div>
    );
  } else {
    content = <FormattedMessage {...localMessages.noResults} />;
  }
  return content;
};


StarredSearchResultsContainer.propTypes = {
  // form compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  onToggleSelected: PropTypes.func.isRequired,
  hintTextMsg: PropTypes.object,
  // from state

  favoritedCollections: PropTypes.array,
  favoritedSources: PropTypes.array,
  fetchStatus: PropTypes.string,
  viewOnly: PropTypes.bool,
};


export default
injectIntl(
  StarredSearchResultsContainer
);
