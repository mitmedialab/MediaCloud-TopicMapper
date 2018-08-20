import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import composeSummarizedVisualization from './SummarizedVizualization';
import withLoginRequired from '../../common/hocs/LoginRequiredDialog';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import StoryTable from '../../common/StoryTable';
import { fetchQuerySampleStories, fetchDemoQuerySampleStories, resetSampleStories } from '../../../actions/explorerActions';
import { selectStory, resetStory, fetchStory } from '../../../actions/storyActions';
import { postToDownloadUrl } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import withQueryResults from './QueryResultsSelector';

const localMessages = {
  title: { id: 'explorer.stories.title', defaultMessage: 'Sample Stories' },
  helpIntro: { id: 'explorer.stories.help.title', defaultMessage: '<p>This is a random sample of the stories matching your queries.  These are stories where are least one sentence matches your query.  Click on story title to read it.  Click the menu on the bottom right to download a CSV of stories with their urls.</p>' },
  helpDetails: { id: 'explorer.stories.help.text',
    defaultMessage: '<p>We can provide basic information about stories like the media source, date of publication, and URL.  However, due to copyright restrictions we cannot provide you with the original full text of the stories. Download the CSV results to see all the metadata we have about the stories.</p>',
  },
  downloadCsv: { id: 'explorer.stories.downloadCsv', defaultMessage: 'Download all { name } stories as a CSV' },
};

class QuerySampleStoriesResultsContainer extends React.Component {
  onStorySelection = (selectedStory) => {
    const { handleStorySelection, selectedQuery, isLoggedIn, onShowLoginDialog } = this.props;
    if (isLoggedIn) {
      handleStorySelection(selectedQuery, selectedStory);
    } else {
      onShowLoginDialog();
    }
  }

  downloadCsv = (query) => {
    postToDownloadUrl('/api/explorer/stories/samples.csv', query);
  }

  render() {
    const { results, queries, selectedTabIndex, tabSelector, internalItemSelected } = this.props;
    return (
      <div>
        {tabSelector}
        <StoryTable
          className="story-table"
          stories={results[selectedTabIndex] ? results[selectedTabIndex].slice(0, 10) : []}
          onChangeFocusSelection={story => this.onStorySelection(story)}
          maxTitleLength={90}
          selectedStory={internalItemSelected}
        />
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <MenuItem
              className="action-icon-menu-item"
              onClick={() => this.downloadCsv(queries[selectedTabIndex])}
            >
              <ListItemText>
                <FormattedMessage {...localMessages.downloadCsv} values={{ name: queries[selectedTabIndex].label }} />
              </ListItemText>
              <ListItemIcon>
                <DownloadButton />
              </ListItemIcon>
            </MenuItem>
          </ActionMenu>
        </div>
      </div>
    );
  }
}

QuerySampleStoriesResultsContainer.propTypes = {
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from hocs
  intl: PropTypes.object.isRequired,
  onShowLoginDialog: PropTypes.func.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  // from mergeProps
  asyncFetch: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  handleStorySelection: PropTypes.func.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  selectedQuery: PropTypes.object.isRequired,
  tabSelector: PropTypes.object.isRequired,
  internalItemSelected: PropTypes.number,
};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  fetchStatus: state.explorer.stories.fetchStatus,
  results: state.explorer.stories.results,
  internalItemSelected: state.story.info.stories_id,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (queries) => {
    // this should trigger when the user clicks the Search button or changes the URL
    // for n queries, run the dispatch with each parsed query
    dispatch(resetStory());
    dispatch(resetSampleStories());
    if (ownProps.isLoggedIn) {
      const runTheseQueries = queries || ownProps.queries;
      runTheseQueries.map((q) => {
        const infoToQuery = {
          start_date: q.startDate,
          end_date: q.endDate,
          q: q.q,
          index: q.index,
          sources: q.sources.map(s => s.id),
          collections: q.collections.map(c => c.id),
        };
        return dispatch(fetchQuerySampleStories(infoToQuery));
      });
    } else if (queries || ownProps.queries) { // else assume DEMO mode, but assume the queries have been loaded
      const runTheseQueries = queries || ownProps.queries;
      runTheseQueries.map((q, index) => {
        const demoInfo = {
          index, // should be same as q.index btw
          search_id: q.searchId, // may or may not have these
          query_id: q.id,
          q: q.q, // only if no query id, means demo user added a keyword
        };
        return dispatch(fetchDemoQuerySampleStories(demoInfo)); // id
      });
    }
  },
  handleStorySelection: (query, story) => {
    // we should select and fetch since that's the pattern, even if we have the story info
    dispatch(selectStory(story.stories_id));
    dispatch(fetchStory(story.stories_id));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(ownProps.queries);
    },
    shouldUpdate: (nextProps) => { // QueryResultsSelector needs to ask the child for internal repainting
      const { internalItemSelected } = stateProps;
      return nextProps.internalItemSelected !== internalItemSelected;
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeSummarizedVisualization(localMessages.title, localMessages.helpIntro, localMessages.helpDetails)(
        withAsyncFetch(
          withQueryResults(
            withLoginRequired(
              QuerySampleStoriesResultsContainer
            )
          )
        )
      )
    )
  );
