import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { fetchStoryInlinks } from '../../../actions/topicActions';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import withHelp from '../../common/hocs/HelpfulContainer';
import messages from '../../../resources/messages';
import TopicStoryTable from '../TopicStoryTable';
import DataCard from '../../common/DataCard';
import TopicPropTypes from '../TopicPropTypes';
import { DownloadButton } from '../../common/IconButton';

const localMessages = {
  helpTitle: { id: 'story.inlinks.help.title', defaultMessage: 'About Story Inlinks' },
  helpIntro: { id: 'story.inlinks.help.intro', defaultMessage: '<p>This is a table of stories that link to this Story within the Topic.</p>' },
};

const StoryInlinksContainer = (props) => {
  const { inlinkedStories, showTweetCounts, topicId, helpButton, storiesId, filters } = props;
  const { formatMessage } = props.intl;
  return (
    <DataCard>
      <div className="actions">
        <DownloadButton
          tooltip={formatMessage(messages.download)}
          onClick={() => {
            const url = `/api/topics/${topicId}/stories/${storiesId}/inlinks.csv?timespanId=${filters.timespanId}&q=${filters.q}`;
            window.location = url;
          }}
        />
      </div>
      <h2>
        <FormattedMessage {...messages.inlinks} />
        {helpButton}
      </h2>
      <TopicStoryTable stories={inlinkedStories} showTweetCounts={showTweetCounts} topicId={topicId} />
    </DataCard>
  );
};

StoryInlinksContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  // from parent
  storiesId: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  inlinkedStories: PropTypes.array.isRequired,
  showTweetCounts: PropTypes.bool,
  filters: TopicPropTypes.filters.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.story.inlinks.fetchStatus,
  inlinkedStories: state.topics.selected.story.inlinks.stories,
  showTweetCounts: Boolean(state.topics.selected.info.ch_monitor_id),
  filters: state.topics.selected.filters,
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchStoryInlinks(props.topicId, props.storiesId, props.filters));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, [localMessages.helpIntro, messages.wordcloudHelpText])(
      withFilteredAsyncData(fetchAsyncData)(
        StoryInlinksContainer
      )
    )
  )
);
