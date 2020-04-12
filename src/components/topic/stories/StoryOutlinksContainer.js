import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { fetchStoryOutlinks } from '../../../actions/topicActions';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import withHelp from '../../common/hocs/HelpfulContainer';
import messages from '../../../resources/messages';
import TopicStoryTable from '../TopicStoryTable';
import DataCard from '../../common/DataCard';
import TopicPropTypes from '../TopicPropTypes';
import { DownloadButton } from '../../common/IconButton';

const localMessages = {
  helpTitle: { id: 'story.inlinks.help.title', defaultMessage: 'About Story Outlinks' },
  helpIntro: { id: 'story.inlinks.help.intro', defaultMessage: '<p>This is a table of stories within this Topic that this Story links to.</p>' },
};

const StoryOutlinksContainer = (props) => {
  const { outlinkedStories, showTweetCounts, topicId, helpButton, storiesId, filters } = props;
  const { formatMessage } = props.intl;
  return (
    <DataCard>
      <div className="actions">
        <DownloadButton
          tooltip={formatMessage(messages.download)}
          onClick={() => {
            const url = `/api/topics/${topicId}/stories/${storiesId}/outlinks.csv?timespanId=${filters.timespanId}&q=${filters.q}`;
            window.location = url;
          }}
        />
      </div>
      <h2>
        <FormattedMessage {...messages.outlinks} />
        {helpButton}
      </h2>
      <TopicStoryTable stories={outlinkedStories} showTweetCounts={showTweetCounts} topicId={topicId} />
    </DataCard>
  );
};

StoryOutlinksContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  // from parent
  storiesId: PropTypes.number.isRequired,
  topicId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  outlinkedStories: PropTypes.array.isRequired,
  showTweetCounts: PropTypes.bool,
  filters: TopicPropTypes.filters.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.story.outlinks.fetchStatus,
  outlinkedStories: state.topics.selected.story.outlinks.stories,
  showTweetCounts: Boolean(state.topics.selected.info.ch_monitor_id),
  filters: state.topics.selected.filters,
});

const fetchAsyncData = (dispatch, props) => {
  dispatch(fetchStoryOutlinks(props.topicId, props.storiesId, props.filters));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, [localMessages.helpIntro, messages.wordcloudHelpText])(
      withFilteredAsyncData(fetchAsyncData)(
        StoryOutlinksContainer
      )
    )
  )
);
