import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { fetchStoryRedditAttention } from '../../../actions/storyActions';
import withAsyncData from '../hocs/AsyncDataContainer';
import withHelp from '../hocs/HelpfulContainer';
import messages from '../../../resources/messages';
import DataCard from '../DataCard';
import { DownloadButton } from '../IconButton';
import TreeMap from '../../vis/TreeMap';

const localMessages = {
  title: { id: 'story.reddit.title', defaultMessage: 'Attention on Reddit' },
  chartTitle: { id: 'story.reddit.chartTitle', defaultMessage: 'Submissions by Subreddit' },
  intro: { id: 'story.reddit.total', defaultMessage: 'Shared {total} times on Reddit (as of {date}).' },
  helpTitle: { id: 'story.reddit.help.title', defaultMessage: 'About Attention on Reddit' },
  helpIntro: { id: 'story.reddit.help.text', defaultMessage: '<p>We work with <a href="https://pushshift.io" target="new">PushShift.io</a> to look at influence on Reddit. This data includes live data about how this story has been shared on Reddit and is not limited to the date range of this Topic. It is best to note "as of [date]" if you plan to use these results.</p>' },
};

const StoryRedditAttention = ({ total, bySub, helpButton, storyId, intl }) => (
  <DataCard className="story-reddit-container">
    <div className="actions">
      <DownloadButton
        tooltip={intl.formatMessage(messages.download)}
        onClick={() => {
          const url = `/api/stories/${storyId}/reddit-attention.csv`;
          window.location = url;
        }}
      />
    </div>
    <h2>
      <FormattedMessage {...localMessages.title} />
      {helpButton}
    </h2>
    <p>
      <FormattedMessage
        {...localMessages.intro}
        values={{
          total: intl.formatNumber(total),
          date: intl.formatDate(new Date()),
        }}
      />
    </p>
    { bySub && (total > 0) && (
      <TreeMap
        title={localMessages.chartTitle}
        data={bySub}
        domId={`story${storyId}subreddits`}
        height={600}
      />
    )}
  </DataCard>
);

StoryRedditAttention.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  // from parent
  storyId: PropTypes.number.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  bySub: PropTypes.array,
  total: PropTypes.number,
};

const mapStateToProps = state => ({
  fetchStatus: state.story.reddit.fetchStatus,
  total: state.story.reddit.total,
  bySub: state.story.reddit.subreddits,
});

const fetchAsyncData = (dispatch, { storyId }) => dispatch(fetchStoryRedditAttention(storyId));

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, localMessages.helpIntro)(
      withAsyncData(fetchAsyncData, ['storyId'])(
        StoryRedditAttention
      )
    )
  )
);
