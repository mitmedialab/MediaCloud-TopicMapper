import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../../../../common/hocs/AsyncDataContainer';
import withHelp from '../../../../../common/hocs/HelpfulContainer';
import { fetchCreateFocusSearchStoryCounts } from '../../../../../../actions/topicActions';
import DataCard from '../../../../../common/DataCard';
import BubbleRowChart from '../../../../../vis/BubbleRowChart';
import { getBrandDarkColor } from '../../../../../../styles/colors';

const BUBBLE_CHART_DOM_ID = 'bubble-chart-keyword-preview-story-total';

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
        domId={BUBBLE_CHART_DOM_ID}
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
  searchValues: PropTypes.array.isRequired,
  // from state
  counts: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.focalSets.create.matchingStoryCounts.fetchStatus,
  counts: state.topics.selected.focalSets.create.matchingStoryCounts.counts,
});

const fetchAsyncData = (dispatch, { topicId, searchValues }) => {
  const collections = searchValues.filter(obj => obj.tags_id).map(s => s.tags_id);
  const sources = searchValues.filter(obj => obj.media_id).map(s => s.media_id);
  dispatch(fetchCreateFocusSearchStoryCounts(topicId, { 'collections[]': JSON.stringify(collections), 'sources[]': JSON.stringify(sources) }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withHelp(localMessages.helpTitle, localMessages.helpText)(
      withAsyncData(fetchAsyncData, ['keywords'])(
        SearchStoryCountPreviewContainer
      )
    )
  )
);
