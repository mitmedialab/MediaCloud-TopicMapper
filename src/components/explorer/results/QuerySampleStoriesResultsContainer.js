import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AppButton from '../../common/AppButton';
import withSummary from '../../common/hocs/SummarizedVizualization';
import withLoginRequired from '../../common/hocs/LoginRequiredDialog';
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
  showMetadata: { id: 'explorer.stories.showMetadata', defaultMessage: 'Info' },
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
    postToDownloadUrl('/api/explorer/stories/all-story-urls.csv', query);
  }

  render() {
    const { results, selectedQuery, tabSelector, internalItemSelected } = this.props;
    const showMoreInfoColHdr = <th />;
    const showMoreInfoCol = story => (
      <td>
        <AppButton
          onClick={() => this.onStorySelection(story)}
          label={localMessages.showMetadata}
        />
      </td>
    );
    const selectedResults = results[selectedQuery.uid];
    if (selectedResults) {
      return (
        <>
          {tabSelector}
          <StoryTable
            className="story-table"
            stories={selectedResults.results.slice(0, 10)}
            onMoreInfo={story => this.onStorySelection(story)}
            maxTitleLength={90}
            selectedStory={internalItemSelected}
            extraheaderColumns={showMoreInfoColHdr}
            extraColumns={story => showMoreInfoCol(story)}
          />
          <div className="actions">
            <ActionMenu actionTextMsg={messages.downloadOptions}>
              <MenuItem
                className="action-icon-menu-item"
                onClick={() => this.downloadCsv(selectedQuery)}
              >
                <ListItemText>
                  <FormattedMessage {...localMessages.downloadCsv} values={{ name: selectedQuery.label }} />
                </ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
            </ActionMenu>
          </div>
        </>
      );
    }
    return <div>Error</div>;
  }
}

QuerySampleStoriesResultsContainer.propTypes = {
  // from hocs
  intl: PropTypes.object.isRequired,
  onShowLoginDialog: PropTypes.func.isRequired,
  // from parent
  selectedQuery: PropTypes.object.isRequired,
  tabSelector: PropTypes.object.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from state
  lastSearchTime: PropTypes.number.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  results: PropTypes.object.isRequired,
  internalItemSelected: PropTypes.number,
  // from dispatch
  handleStorySelection: PropTypes.func.isRequired,
  // from mergeProps
  shouldUpdate: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  fetchStatus: state.explorer.stories.fetchStatus,
  results: state.explorer.stories.results,
  internalItemSelected: state.story.info.stories_id,
});

const mapDispatchToProps = dispatch => ({
  handleStorySelection: (query, story) => {
    // we should select and fetch since that's the pattern, even if we have the story info
    dispatch(selectStory({ id: story.stories_id, search: query.q }));
    dispatch(fetchStory(story.stories_id));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    shouldUpdate: (nextProps) => { // QueryResultsSelector needs to ask the child for internal repainting
      const { internalItemSelected } = stateProps;
      return nextProps.internalItemSelected !== internalItemSelected;
    },
  };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withSummary(localMessages.title, localMessages.helpIntro, localMessages.helpDetails)(
      withLoginRequired(
        withQueryResults([resetStory, resetSampleStories], fetchQuerySampleStories, fetchDemoQuerySampleStories)(
          QuerySampleStoriesResultsContainer
        )
      )
    )
  )
);
