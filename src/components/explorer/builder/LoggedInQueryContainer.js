import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { updateTimestampForQueries, resetSelected, resetSentenceCounts, resetSampleStories,
  resetStoryCounts, resetGeo, selectQuery, removeDeletedQueries, removeNewStatusFromQueries,
  countSourceCollectionUsage } from '../../../actions/explorerActions';
import { resetStory } from '../../../actions/storyActions';
import QueryPickerContainer from './QueryPickerContainer';
import QueryResultsContainer from '../results/QueryResultsContainer';
import composeUrlBasedQueryContainer from '../UrlBasedQueryContainer';
import PageTitle from '../../common/PageTitle';
import { prepSearches } from '../../../lib/explorerUtil';

const localMessages = {
  title: { id: 'explorer.queryBuilder.title', defaultMessage: 'Search' },
};

class LoggedInQueryContainer extends React.Component {
  UNSAFE_componentWillMount() {
    const { selectFirstQuery, queries } = this.props;
    // console.log(queries[0]);
    selectFirstQuery(queries[0]); // on first load select first by default so the builder knows which one to render in the form
  }

  componentWillUnmount() {
    const { resetExplorerData } = this.props;
    resetExplorerData();
  }

  render() {
    const { queries, handleSearch, samples, location, lastSearchTime } = this.props;
    const isEditable = false;
    return (
      <div className="query-container query-container-logged-in">
        <PageTitle value={localMessages.title} />
        <QueryPickerContainer isEditable={isEditable} onSearch={() => handleSearch(queries)} />
        <QueryResultsContainer
          lastSearchTime={lastSearchTime}
          queries={queries}
          params={location}
          samples={samples}
          onSearch={() => handleSearch(queries)}
        />
      </div>
    );
  }
}

LoggedInQueryContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from parent
  initialValues: PropTypes.object,
  // from state
  selected: PropTypes.object,
  queries: PropTypes.array,
  samples: PropTypes.array,
  query: PropTypes.object,
  location: PropTypes.object,
  // from dispatch
  resetExplorerData: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  lastSearchTime: PropTypes.number,
  // from dispath
  selectFirstQuery: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  selected: state.explorer.selected,
  selectedQuery: state.explorer.selected,
  queries: state.explorer.queries.queries,
  lastSearchTime: state.explorer.lastSearchTime.time,
  samples: state.explorer.samples.list,
});

// push any updates (including selected) into queries in state, will trigger async load in sub sections
const mapDispatchToProps = dispatch => ({
  resetExplorerData: () => {
    dispatch(resetSelected());
    // dispatch(resetQueries());
    dispatch(resetSentenceCounts());
    dispatch(resetSampleStories());
    dispatch(resetStory());
    dispatch(resetStoryCounts());
    dispatch(resetGeo());
  },
  handleSearch: (queries) => {
    // track usage here because we don't know what results tab the user is on and only wanna count it once
    const sources = queries
      .map(q => q.sources.map(s => s.media_id))
      .reduce((combined, current) => [...combined, ...current]);
    const collections = queries
      .map(q => q.collections.map(c => c.tags_id))
      .reduce((combined, current) => [...combined, ...current]);
    const searchTagsPerQuery = queries.map((q) => {
      if (q.searches) {
        return prepSearches(q.searches); // with metadata objects
      }
      return null;
    });

    dispatch(countSourceCollectionUsage({ sources, collections, searchTagsPerQuery }));
    dispatch(removeDeletedQueries());
    dispatch(removeNewStatusFromQueries());
    dispatch(updateTimestampForQueries()); // but this doesn't update the query... only the timestamp.. nextprops.queries should be new?
    // update URL location according to updated queries
  },
  selectFirstQuery: (query) => {
    dispatch(selectQuery(query));
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    composeUrlBasedQueryContainer()(
      LoggedInQueryContainer
    )
  )
);
