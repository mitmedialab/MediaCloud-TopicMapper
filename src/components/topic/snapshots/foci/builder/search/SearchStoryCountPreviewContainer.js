import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withFilteredAsyncData from '../../../../FilteredAsyncDataContainer';
import withHelp from '../../../../../common/hocs/HelpfulContainer';
import { fetchTopicProviderCount } from '../../../../../../actions/topicActions';
import DataCard from '../../../../../common/DataCard';
import BubbleRowChart from '../../../../../vis/BubbleRowChart';
import { getBrandDarkColor } from '../../../../../../styles/colors';
import { FETCH_INVALID } from '../../../../../../lib/fetchConstants';

export const searchValuesToQuery = (searchValues) => {
  const queryClauses = [];
  if (searchValues.media) { // check for any media / collections
    const collections = searchValues.media.filter(obj => obj.tags_id).map(s => s.tags_id);
    if (collections.length > 0) {
      queryClauses.push(`(tags_id_media:(${collections.join(' ')}))`);
    }
    const sources = searchValues.media.filter(obj => obj.media_id).map(s => s.media_id);
    if (sources.length > 0) {
      queryClauses.push(`(media_id:(${sources.join(' ')}))`);
    }
  }
  if (searchValues.keywords) { // check for any keywords
    queryClauses.push(`(${searchValues.keywords})`);
  }
  // combine keywords and media/collections into a single query
  const query = queryClauses.join(' AND ');
  return query;
};

const localMessages = {
  title: { id: 'topic.snapshot.keywords.storyCount.title', defaultMessage: 'Story Counts' },
  helpTitle: { id: 'topic.snapshot.keywords.storyCount.help.title', defaultMessage: 'About Story Counts' },
  helpText: { id: 'topic.snapshot.keywords.storyCount.help.text',
    defaultMessage: '<p>This is a visualization showing the how many of the stories from the total Topic would be included within this Subtopic.</p>',
  },
  filteredLabel: { id: 'topic.snapshot.keywords.storyCount.matching', defaultMessage: 'Matching Stories' },
  totalLabel: { id: 'topic.snapshot.keywords.storyCount.total', defaultMessage: 'All Stories' },
};

const SearchStoryCountPreviewContainer = (props) => {
  const { counts, helpButton } = props;
  const { formatMessage, formatNumber } = props.intl;
  let content = null;
  if (counts !== null) {
    const data = [ // format the data for the bubble chart help
      {
        value: counts.count,
        fill: getBrandDarkColor(),
        aboveText: formatMessage(localMessages.filteredLabel),
        aboveTextColor: 'rgb(255,255,255)',
        rolloverText: `${formatMessage(localMessages.filteredLabel)}: ${formatNumber(counts.count)} stories`,
      },
      {
        value: counts.total,
        aboveText: formatMessage(localMessages.totalLabel),
        rolloverText: `${formatMessage(localMessages.totalLabel)}: ${formatNumber(counts.total)} stories`,
      },
    ];
    content = (
      <BubbleRowChart
        data={data}
        width={400}
        padding={30}
      />
    );
  }
  return (
    <DataCard>
      <h2>
        <FormattedMessage {...localMessages.title} />
        {helpButton}
      </h2>
      {content}
    </DataCard>
  );
};

SearchStoryCountPreviewContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  searchValues: PropTypes.object.isRequired,
  // from state
  counts: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.provider.count.fetchStatuses.focusBuilder || FETCH_INVALID,
  counts: state.topics.selected.provider.count.results.focusBuilder || {},
});

const fetchAsyncData = (dispatch, { topicId, searchValues, filters }) => dispatch(fetchTopicProviderCount(topicId, {
  uid: 'focusBuilder',
  subQuery: searchValuesToQuery(searchValues),
  // subtopics work at the snapshot level, make sure to search the whole snapshot (not the timespan the user might have selected)
  snapshotId: filters.snapshotId,
  timespanId: null,
  focusId: null,
  q: null,
}));

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, localMessages.helpText)(
      withFilteredAsyncData(fetchAsyncData, ['searchValues'])(
        SearchStoryCountPreviewContainer
      )
    )
  )
);
