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
import { HELP_STORIES_CSV_COLUMNS } from '../../../lib/helpConstants';

const NUM_TO_SHOW = 10;
const TOP_N_DOWNLOAD = 2000;

const localMessages = {
  title: { id: 'topic.summary.stories.title', defaultMessage: 'Top Stories' },
  descriptionIntro: { id: 'topic.summary.stories.help.title', defaultMessage: '<p>The top stories within this topic can suggest the main ways it is talked about.  Sort by different measures to get a better picture of a story\'s influence.</p>' },
  downloadNoFBData: { id: 'topic.summary.stories.download.noFB', defaultMessage: 'Download CSV with all stories' },
  downloadTopN: { id: 'topic.summary.stories.download.1k', defaultMessage: `Download CSV with top ${TOP_N_DOWNLOAD} stories (w/Reddit data)` },
  downloadWithFBData: { id: 'topic.summary.stories.download.withFB', defaultMessage: 'Download CSV with all stories & Facebook collection date (takes longer)' },
  downloadLinkCsv: { id: 'topic.summary.stories.download.downloadLinkCsv', defaultMessage: 'Download CSV of all story links' },
};

class StoriesSummaryContainer extends React.Component {
  onChangeSort = (newSort) => {
    const { sortData } = this.props;
    sortData(newSort);
  };

  downloadCsvNoFBData = () => {
    const { filters, sort, topicId, notifyOfCsvDownload } = this.props;
    const url = `/api/topics/${topicId}/stories.csv?${filtersAsUrlParams(filters)}&sort=${sort}`;
    window.location = url;
    notifyOfCsvDownload(HELP_STORIES_CSV_COLUMNS);
  }

  downloadCsvTopN = () => {
    const { filters, sort, topicId, notifyOfCsvDownload } = this.props;
    const url = `/api/topics/${topicId}/stories.csv?${filtersAsUrlParams(filters)}&sort=${sort}&story_limit=${TOP_N_DOWNLOAD}&reddit_submissions=1`;
    window.location = url;
    notifyOfCsvDownload(HELP_STORIES_CSV_COLUMNS);
  }

  downloadCsvWithFBData = () => {
    const { filters, sort, topicId, notifyOfCsvDownload } = this.props;
    const url = `/api/topics/${topicId}/stories.csv?${filtersAsUrlParams(filters)}&sort=${sort}&fbData=1`;
    window.location = url;
    notifyOfCsvDownload(HELP_STORIES_CSV_COLUMNS);
  }

  downloadLinkCsv = () => {
    const { filters, sort, topicId } = this.props;
    const url = `/api/topics/${topicId}/stories/story-links.csv?${filtersAsUrlParams(filters)}&sort=${sort}`;
    window.location = url;
  }

  render() {
    const { stories, sort, topicId, handleFocusSelected, user, showTweetCounts } = this.props;
    const isLoggedIn = hasPermissions(getUserRoles(user), PERMISSION_LOGGED_IN);
    return (
      <React.Fragment>
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
                id="topic-summary-top-stories-download"
                onClick={this.downloadCsvNoFBData}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadNoFBData} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-N-stories-download"
                onClick={this.downloadCsvTopN}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadTopN} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-stories-download-with-facebook"
                onClick={this.downloadCsvWithFBData}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadWithFBData} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
              <MenuItem
                className="action-icon-menu-item"
                id="topic-summary-top-stories-download-links"
                onClick={this.downloadLinkCsv}
              >
                <ListItemText><FormattedMessage {...localMessages.downloadLinkCsv} /></ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
            </ActionMenu>
          </div>
        </Permissioned>
      </React.Fragment>
    );
  }
}

StoriesSummaryContainer.propTypes = {
  // from the composition chain
  intl: PropTypes.object.isRequired,
  notifyOfCsvDownload: PropTypes.func.isRequired,
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
          StoriesSummaryContainer
        ),
      )
    )
  )
);
