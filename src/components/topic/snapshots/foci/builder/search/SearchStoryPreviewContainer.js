import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withFilteredAsyncData from '../../../../FilteredAsyncDataContainer';
import withHelp from '../../../../../common/hocs/HelpfulContainer';
import { fetchTopicProviderStories } from '../../../../../../actions/topicActions';
import DataCard from '../../../../../common/DataCard';
import TopicStoryTableContainer from '../../../../TopicStoryTableContainer';
import messages from '../../../../../../resources/messages';
import { FETCH_INVALID } from '../../../../../../lib/fetchConstants';
import { searchValuesToQuery } from './SearchStoryCountPreviewContainer';

const NUM_TO_SHOW = 20;

const localMessages = {
  title: { id: 'topic.summary.stories.title', defaultMessage: 'Sample Stories' },
  helpTitle: { id: 'topic.summary.stories.help.title', defaultMessage: 'About Matching Top Stories' },
};

const SearchStoryPreviewContainer = (props) => {
  const { stories, helpButton } = props;
  return (
    <DataCard>
      <h2>
        <FormattedMessage {...localMessages.title} />
        {helpButton}
      </h2>
      <TopicStoryTableContainer stories={stories.slice(0, NUM_TO_SHOW)} />
    </DataCard>
  );
};

SearchStoryPreviewContainer.propTypes = {
  // from the composition chain
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  searchValues: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  stories: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.provider.stories.fetchStatuses.focusBuilder || FETCH_INVALID,
  stories: state.topics.selected.provider.stories.results.focusBuilder ? state.topics.selected.provider.stories.results.focusBuilder.stories : {},
});

const fetchAsyncData = (dispatch, { topicId, searchValues, filters }) => dispatch(fetchTopicProviderStories(topicId, {
  uid: 'focusBuilder',
  // subtopics work at the snapshot level, make sure to search the whole snapshot (not the timespan the user might have selected)
  snapshotId: filters.snapshotId,
  timespanId: null,
  focusId: null,
  q: searchValuesToQuery(searchValues),
}));

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, messages.storiesTableHelpText)(
      withFilteredAsyncData(fetchAsyncData, ['searchValues'])(
        SearchStoryPreviewContainer
      )
    )
  )
);
