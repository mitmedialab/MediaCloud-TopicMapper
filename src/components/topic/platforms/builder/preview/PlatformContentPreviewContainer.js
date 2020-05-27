import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import withAsyncData from '../../../../common/hocs/AsyncDataContainer';
import withDescription from '../../../../common/hocs/DescribedDataCard';
import { fetchPlatformSample } from '../../../../../actions/platformActions';
import DataCard from '../../../../common/DataCard';
import StoryTable from '../../../../common/StoryTable';
import { topicQueryAsString } from '../../../../util/topicUtil';

const NUM_TO_SHOW = 20;

const formSelector = formValueSelector('platform');

const localMessages = {
  title: { id: 'topic.summary.stories.title', defaultMessage: 'Sample Content' },
  description: { id: 'topic.summary.stories.description', defaultMessage: 'This is a random sample of the content matching your query on this platform.' },
};

const PlatformContentPreviewContainer = ({ stories, showTweetCounts, topic }) => (
  <DataCard>
    <h2>
      <FormattedMessage {...localMessages.title} />
    </h2>
    <StoryTable stories={stories.slice(0, NUM_TO_SHOW)} showTweetCounts={showTweetCounts} topicId={topic.topics_id} />
  </DataCard>
);

PlatformContentPreviewContainer.propTypes = {
  // from the composition chain
  intl: PropTypes.object.isRequired,
  // from parent
  topic: PropTypes.object.isRequired,
  lastUpdated: PropTypes.number,
  formatPlatformChannelData: PropTypes.func, // will be pass the formValues, and should return a string suitable for upload to server
  // from state
  fetchStatus: PropTypes.string.isRequired,
  stories: PropTypes.array,
  supported: PropTypes.bool,
  showTweetCounts: PropTypes.bool,
  selectedPlatform: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  topic: state.topics.selected.info,
  fetchStatus: state.platforms.sample.fetchStatus,
  stories: state.platforms.sample.list,
  supported: state.platforms.sample.supported,
  formValues: formSelector(state, 'media', 'query', 'channel'),
  selectedPlatform: state.topics.selected.platforms.selected,
});

const fetchAsyncData = (dispatch, { topic, formValues, selectedPlatform, formatPlatformChannelData }) => {
  // call the fetcher the parent passed in to fetch the data we want to show
  dispatch(fetchPlatformSample({
    platform_type: selectedPlatform.platform,
    platform_query: topicQueryAsString(formValues.query),
    platform_source: selectedPlatform.source,
    platform_channel: formatPlatformChannelData ? JSON.stringify(formatPlatformChannelData(formValues)) : JSON.stringify(formValues),
    start_date: topic.start_date,
    end_date: topic.end_date,
  }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['lastUpdated', 'supported'])(
      withDescription(localMessages.description, null, 'supported')(
        PlatformContentPreviewContainer
      )
    )
  )
);
