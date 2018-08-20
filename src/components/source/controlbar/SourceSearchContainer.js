import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import LoadingSpinner from '../../common/LoadingSpinner';
import { SearchButton } from '../../common/IconButton';
import { FETCH_ONGOING, FETCH_SUCCEEDED } from '../../../lib/fetchConstants';
import { fetchSourceSearch, fetchCollectionSearch, resetSourceSearch, resetCollectionSearch } from '../../../actions/sourceActions';

const MAX_SUGGESTION_CHARS = 70;
const DEFAULT_MAX_SOURCES_TO_SHOW = 5;
const DEFAULT_MAX_COLLECTIONS_TO_SHOW = 3;

const DELAY_BEFORE_SEARCH_MS = 500; // wait this long after a keypress to fire a search

const ADVANCED_SEARCH_ITEM_VALUE = 'advanced';

const localMessages = {
  advancedSearch: { id: 'sources.search.advanced', defaultMessage: 'Advanced Search...' },
  searchHint: { id: 'sources.search.hint', defaultMessage: 'Search for sources or collections' },
};

class SourceSearchContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lastSearchString: '',
      lastKeypress: 0,
      searchTimeout: null,
    };
  }

  getMaxSourcesToShow = () => {
    const { maxSources } = this.props;
    return maxSources || DEFAULT_MAX_SOURCES_TO_SHOW;
  }

  getMaxCollectionsToShow = () => {
    const { maxCollections } = this.props;
    return maxCollections || DEFAULT_MAX_COLLECTIONS_TO_SHOW;
  }

  handleClick = (item) => {
    const { onMediaSourceSelected, onCollectionSelected, onAdvancedSearchSelected } = this.props;
    if (item) {
      if (item.type === 'mediaSource') {
        if (onMediaSourceSelected) onMediaSourceSelected(item);
      } else if (item.type === 'collection') {
        if (onCollectionSelected) onCollectionSelected(item);
      } else if (item === ADVANCED_SEARCH_ITEM_VALUE) {
        if (onAdvancedSearchSelected) onAdvancedSearchSelected('');
      }
    }
    // annoyingly need to timeout to reset the field after selection is made (so it fires after menuCloseDelay)
    // @see https://stackoverflow.com/questions/34387787/how-to-clear-the-text-in-a-material-ui-auto-complete-field
    setTimeout(() => {
      this.setState({ lastSearchString: '' });
    }, 300);
  }

  fireSearchIfNeeded = () => {
    const { search } = this.props;
    const shouldSearch = this.state.lastSearchString.length > 3;
    if (shouldSearch) {
      search(this.state.lastSearchString);
    }
  }

  handleMenuItemKeyDown = (item, event) => {
    switch (event.key) {
      case 'Enter':
        this.handleClick(item);
        break;
      default: break;
    }
  }

  resetIfRequested = () => {
    const { sourceResults, collectionResults, searchSources, searchCollections, onAdvancedSearchSelected,
      disableStaticCollections } = this.props;
    const { formatMessage } = this.props.intl;
    let results = [];
    // if (!fetchesSucceeded) return [];  // can't wait for both, because collections results are too slow :-(
    if (searchSources || searchSources === undefined) { // sources always return first, so so them first so list isn't jumpy
      results = results.concat(sourceResults.slice(0, this.getMaxSourcesToShow()));
    }
    if (searchCollections || searchCollections === undefined) {
      results = results.concat(collectionResults.slice(0, this.getMaxCollectionsToShow()));
    }
    let resultsAsComponents = results.map((item) => {
      let menuItemValue = (
        <MenuItem
          onClick={() => this.handleClick(item)}
          onKeyDown={this.handleMenuItemKeyDown.bind(this, item)}
          id={`searchResult${item.media_id || item.tags_id}`}
          primaryText={(item.name.length > MAX_SUGGESTION_CHARS) ? `${item.name.substr(0, MAX_SUGGESTION_CHARS)}...` : item.name}
        />
      );
      if (disableStaticCollections && item.is_static === 1) {
        menuItemValue = (
          <MenuItem
            id={`searchResult${item.media_id || item.tags_id}`}
            primaryText={(item.name.length > MAX_SUGGESTION_CHARS) ? `${item.name.substr(0, MAX_SUGGESTION_CHARS)}...` : `${item.name} is static and cannot be added`}
            style={{ color: '#aaaaaa' }}
            disabled
          />
        );
      }
      return ({
        text: item.name,
        value: menuItemValue,
      });
    });

    if (onAdvancedSearchSelected !== undefined) {
      resultsAsComponents = resultsAsComponents.concat({
        text: formatMessage(localMessages.advancedSearch),
        key: formatMessage(localMessages.advancedSearch),
        value: <MenuItem
          value={ADVANCED_SEARCH_ITEM_VALUE}
          onClick={() => this.handleClick(ADVANCED_SEARCH_ITEM_VALUE)}
          onKeyDown={this.handleMenuItemKeyDown.bind(this, ADVANCED_SEARCH_ITEM_VALUE)}
          primaryText={formatMessage(localMessages.advancedSearch)}
        />,
      });
    }
    return resultsAsComponents;
  }

  handleUpdateInput = (searchString) => {
    clearTimeout(this.state.searchTimeout); // cancel any pending searches
    this.setState({
      lastSearchString: searchString,
      searchTimeout: setTimeout(this.fireSearchIfNeeded, DELAY_BEFORE_SEARCH_MS),  // schedule a search for when they stop typing
    });
  }

  handleNewRequest = (searchString, index) => {
    const { search } = this.props;
    if (index === -1) { // they pressed enter in the text field
      search(searchString);
    }
    // else: they clicked an item and it will take care of things itself
  }

  render() {
    const { fetchesOngoing } = this.props;
    const { formatMessage } = this.props.intl;
    const resultsAsComponents = this.resetIfRequested();
    const fetchingStatus = (fetchesOngoing) ? <LoadingSpinner size={15} /> : null;
    return (
      <div className="async-search source-search">
        <SearchButton />
        <div className="fetching">{fetchingStatus}</div>
        <AutoComplete
          label={formatMessage(localMessages.searchHint)}
          fullWidth
          openOnFocus
          searchText={this.state.lastSearchString}
          onClick={this.resetIfRequested}
          dataSource={resultsAsComponents}
          onUpdateInput={this.handleUpdateInput}
          onNewRequest={this.handleNewRequest}
          maxSearchResults={this.getMaxSourcesToShow() + this.getMaxCollectionsToShow()}
          filter={() => true}
        />
      </div>
    );
  }

}

SourceSearchContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  // from parent
  searchSources: PropTypes.bool,      // include source results?
  searchCollections: PropTypes.bool,  // include collection results?
  searchStaticCollections: PropTypes.bool,  // inclue static collecton results?
  onMediaSourceSelected: PropTypes.func,
  onCollectionSelected: PropTypes.func,
  onAdvancedSearchSelected: PropTypes.func,
  maxSources: PropTypes.number,
  maxCollections: PropTypes.number,
  // from state
  fetchesOngoing: PropTypes.bool.isRequired,
  fetchesSucceeded: PropTypes.bool.isRequired,
  sourceResults: PropTypes.array.isRequired,
  collectionResults: PropTypes.array.isRequired,
  // from dispatch
  search: PropTypes.func.isRequired,
  disableStaticCollections: PropTypes.bool,
};

const mapStateToProps = state => ({
  fetchesOngoing: (state.sources.search.simple.sources.fetchStatus === FETCH_ONGOING) ||
              (state.sources.search.simple.collections.fetchStatus === FETCH_ONGOING),
  fetchesSucceeded: (state.sources.search.simple.sources.fetchStatus === FETCH_SUCCEEDED) &&
              (state.sources.search.simple.collections.fetchStatus === FETCH_SUCCEEDED),
  sourceResults: state.sources.search.simple.sources.list,
  collectionResults: state.sources.search.simple.collections.list,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  search: (searchString) => {
    // TODO: add support for filtering out static collections, based on `searchStaticCollections` flag
    // handle the situation where you are searching for just collections and NOT sources
    const searchCollections = (ownProps.searchCollections === undefined) || (ownProps.searchCollections === true);
    const searchSources = (ownProps.searchSources === undefined) || (ownProps.searchSources === true);
    if (!searchSources) {
      dispatch(resetSourceSearch());
    } else {
      dispatch(fetchSourceSearch(searchString));
    }
    if (!searchCollections) {
      dispatch(resetCollectionSearch());
    } else {
      dispatch(fetchCollectionSearch(searchString));
    }
  },
});

SourceSearchContainer.propTypes = {
  // from context
  intl: PropTypes.object.isRequired,
};


export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      SourceSearchContainer
    )
  );
