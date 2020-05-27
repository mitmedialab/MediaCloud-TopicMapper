import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { DownloadButton } from '../../common/IconButton';
import withSorting from '../../common/hocs/Sorted';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import { combineQueryParams } from '../../util/location';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import TopicStoryTableContainer from '../TopicStoryTableContainer';
import { fetchTopicProviderStories } from '../../../actions/topicActions';
import DataCard from '../../common/DataCard';
import ActionMenu from '../../common/ActionMenu';
import messages from '../../../resources/messages';
import { FETCH_INVALID } from '../../../lib/fetchConstants';
import { isUrlSharingFocalSet, hasAUrlSharingFocalSet } from '../../../lib/topicVersionUtil';
import withTopicStoryDownload from '../TopicStoryDownloader';

const localMessages = {
  downloadTopStories: { id: 'topic.summary.stories.download.top', defaultMessage: 'Download Top Stories...' },
  fullDownloadTip: { id: 'topic.summary.stories.download.top', defaultMessage: 'See the Summary->Export tab to download all stories' },
};

const TopicStoriesContainer = (props) => (
  <DataCard className={props.className} border={(props.border === true) || (props.border === undefined)}>
    {props.titleMsg && <h2><FormattedHTMLMessage {...props.titleMsg} /></h2>}
    <TopicStoryTableContainer
      stories={props.stories}
      {...props}
    />
    <div className="action-menu-set">
      <ActionMenu actionTextMsg={messages.downloadOptions}>
        <MenuItem
          className="action-icon-menu-item"
          id="topic-summary-top-stories-download-dialog"
          onClick={() => props.showTopicStoryDownloadDialog(props.sort || 'inlink', props.showTweetCounts, null,
            props.usingUrlSharingSubtopic, props.usingUrlSharingFocalSet)}
        >
          <ListItemText><FormattedMessage {...localMessages.downloadTopStories} /></ListItemText>
          <ListItemIcon>
            <DownloadButton />
          </ListItemIcon>
        </MenuItem>
        <MenuItem className="action-icon-menu-item">
          <ListItemText><i><FormattedMessage {...localMessages.fullDownloadTip} /></i></ListItemText>
        </MenuItem>
      </ActionMenu>
    </div>
  </DataCard>
);

TopicStoriesContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  sort: PropTypes.string,
  showTopicStoryDownloadDialog: PropTypes.func.isRequired,
  // from parent
  className: PropTypes.string,
  linkId: PropTypes.string,
  border: PropTypes.bool,
  titleMsg: PropTypes.object,
  uid: PropTypes.string.isRequired, // too support mulitple on one page
  extraArgs: PropTypes.object, // any extra properties you can relayed to the server in the call for listing stories
  extraQueryClause: PropTypes.string,
  // from state
  topicInfo: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  stories: PropTypes.array,
  fetchStatus: PropTypes.string.isRequired,
  showTweetCounts: PropTypes.bool,
  usingUrlSharingSubtopic: PropTypes.bool.isRequired,
  usingUrlSharingFocalSet: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: state.topics.selected.info.topics_id, // redundant, but required by withTopicStoryDownload
  topicInfo: state.topics.selected.info,
  filters: state.topics.selected.filters,
  fetchStatus: state.topics.selected.provider.stories.fetchStatuses[ownProps.uid] || FETCH_INVALID,
  stories: state.topics.selected.provider.stories.results[ownProps.uid] ? state.topics.selected.provider.stories.results[ownProps.uid].stories : [],
  showTweetCounts: Boolean(state.topics.selected.info.ch_monitor_id),
  usingUrlSharingSubtopic: (state.topics.selected.filters.focusId !== null) && isUrlSharingFocalSet(state.topics.selected.timespans.selected.focal_set),
  usingUrlSharingFocalSet: hasAUrlSharingFocalSet(state.topics.selected.focalSets.all.list),
});

const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicProviderStories(props.topicInfo.topics_id, {
  ...props.filters,
  q: combineQueryParams(props.filters.q, props.extraQueryClause),
  ...props.extraArgs,
  uid: props.uid,
  sort: props.sort,
  linkId: props.linkId,
}));

export default
injectIntl(
  connect(mapStateToProps)(
    withSorting(
      withCsvDownloadNotifyContainer(
        withTopicStoryDownload()(
          withFilteredAsyncData(fetchAsyncData, ['sort', 'linkId'])(
            TopicStoriesContainer,
          )
        )
      )
    )
  )
);
