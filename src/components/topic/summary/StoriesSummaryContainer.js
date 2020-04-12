import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { fetchTopicTopStories, sortTopicTopStories, filterByFocus } from '../../../actions/topicActions';
import Permissioned from '../../common/Permissioned';
import { getUserRoles, hasPermissions, PERMISSION_LOGGED_IN } from '../../../lib/auth';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import TopicStoryTable from '../TopicStoryTable';
import messages from '../../../resources/messages';
import { urlWithFilters, filtersAsUrlParams } from '../../util/location';
import withTopicStoryDownload from '../TopicStoryDownloader';

const NUM_TO_SHOW = 10;

const localMessages = {
  title: { id: 'topic.summary.stories.title', defaultMessage: 'Top Stories' },
  descriptionIntro: { id: 'topic.summary.stories.help.title', defaultMessage: '<p>The top stories within this topic can suggest the main ways it is talked about.  Sort by different measures to get a better picture of a story\'s influence.</p>' },
  downloadTopStories: { id: 'topic.summary.stories.download.top', defaultMessage: 'Download Top Stories...' },
  handleStoryLinkCsvDownload: { id: 'topic.summary.stories.download.handleStoryLinkCsvDownload', defaultMessage: 'Download CSV of all links between stories' },
};

class StoriesSummaryContainer extends React.Component {
  onChangeSort = (newSort) => {
    const { sortData } = this.props;
    sortData(newSort);
  }

  handleStoryLinkCsvDownload = () => {
    const { filters, sort, topicId } = this.props;
    const url = `/api/topics/${topicId}/stories/story-links.csv?${filtersAsUrlParams(filters)}&sort=${sort}`;
    window.location = url;
  }

  render() {
    const { stories, sort, topicId, handleFocusSelected, user, showTweetCounts, showTopicStoryDownloadDialog } = this.props;
    const isLoggedIn = hasPermissions(getUserRoles(user), PERMISSION_LOGGED_IN);
    return (
      <>
        <TopicStoryTable
          stories={stories}
          showTweetCounts={showTweetCounts}
          topicId={topicId}
          onChangeSort={isLoggedIn ? this.onChangeSort : null}
          onChangeFocusSelection={handleFocusSelected}
          sortedBy={sort}
          maxTitleLength={50}
        />
        <Permissioned onlyRole={PERMISSION_LOGGED_IN}>
          <div className="actions">
            <ActionMenu actionTextMsg={messages.downloadOptions}>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-stories-download-dialog"
                onClick={() => showTopicStoryDownloadDialog(sort, showTweetCounts)}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadTopStories} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-stories-download-links"
                onClick={this.handleStoryLinkCsvDownload}
              >
                <ListItemText><FormattedMessage {...localMessages.handleStoryLinkCsvDownload} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
            </ActionMenu>
          </div>
        </Permissioned>
      </>
    );
  }
}

StoriesSummaryContainer.propTypes = {
  // from the composition chain
  intl: PropTypes.object.isRequired,
  notifyOfCsvDownload: PropTypes.func.isRequired,
  showTopicStoryDownloadDialog: PropTypes.func.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  // from dispatch
  handleFocusSelected: PropTypes.func.isRequired,
  sortData: PropTypes.func.isRequired,
  handleExplore: PropTypes.string.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  sort: PropTypes.string.isRequired,
  stories: PropTypes.array,
  user: PropTypes.object,
  showTweetCounts: PropTypes.bool,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.summary.topStories.fetchStatus,
  sort: state.topics.selected.summary.topStories.sort,
  stories: state.topics.selected.summary.topStories.stories,
  user: state.user,
  showTweetCounts: Boolean(state.topics.selected.info.ch_monitor_id),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleFocusSelected: (focusId) => {
    dispatch(filterByFocus(focusId));
  },
  sortData: (sort) => {
    dispatch(sortTopicTopStories(sort));
  },
  handleExplore: urlWithFilters(`/topics/${ownProps.topicId}/stories`, ownProps.filters),
});

const fetchAsyncData = (dispatch, props) => {
  const params = {
    ...props.filters,
    sort: props.sort,
    limit: NUM_TO_SHOW,
  };
  dispatch(fetchTopicTopStories(props.topicId, params));
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withSummary(localMessages.title, localMessages.descriptionIntro, messages.storiesTableHelpText, true)(
      withCsvDownloadNotifyContainer(
        withFilteredAsyncData(fetchAsyncData, ['sort'])( // refetch data if sort property has changed
          withTopicStoryDownload()(
            StoriesSummaryContainer
          )
        ),
      )
    )
  )
);
