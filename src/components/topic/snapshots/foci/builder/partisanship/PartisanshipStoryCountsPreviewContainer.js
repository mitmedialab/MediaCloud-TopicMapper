import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../../../../common/hocs/AsyncDataContainer';
import { fetchCreateFocusRetweetStoryCounts } from '../../../../../../actions/topicActions';
import DataCard from '../../../../../common/DataCard';
import BubbleRowChart from '../../../../../vis/BubbleRowChart';

// @see http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=5
const PARTISANSHIP_COLORS = ['#0571b0', '#92c5de', '#666666', '#f4a582', '#ca0020'];

export function usPartisanshipColorFor(name) {
  if (name.toLowerCase() === 'left') return PARTISANSHIP_COLORS[0];
  if (name.toLowerCase() === 'center left') return PARTISANSHIP_COLORS[1];
  if (name.toLowerCase() === 'center') return PARTISANSHIP_COLORS[2];
  if (name.toLowerCase() === 'center right') return PARTISANSHIP_COLORS[3];
  if (name.toLowerCase() === 'right') return PARTISANSHIP_COLORS[4];
  const error = { message: 'Unknown US partisanship name' };
  throw error;
}

const BUBBLE_CHART_DOM_ID = 'focalSetCreatePreviewRetweetPartisanshipCounts';

const localMessages = {
  title: { id: 'topic.snapshot.retweet.storyCount.title', defaultMessage: 'Stories By Partisanship' },
  intro: { id: 'topic.snapshot.retweet.storyCount.intro', defaultMessage: 'This is based on the media sources categorized using the method described above. That means each of the quintiles below is NOT evenly distributed. For instance, while the "center" has just 91 sources, the "right" has 496. Each bubble below shows the percentage of stories that fall into each of the quintiles.' },
};

const PartisanshipStoryCountsPreviewContainer = (props) => {
  const { counts } = props;
  const { formatNumber } = props.intl;
  let content = null;
  if (counts !== null) {
    const data = counts.map((info, idx) => ({
      value: info.pct,
      fill: PARTISANSHIP_COLORS[idx],
      aboveText: info.label,
      aboveTextColor: 'rgb(0,0,0)',
      rolloverText: `${info.label}: ${formatNumber(info.pct, { style: 'percent', maximumFractionDigits: 2 })}`,
    }));
    content = (
      <BubbleRowChart
        data={data}
        domId={BUBBLE_CHART_DOM_ID}
        width={700}
        padding={30}
        maxBubbleRadius={60}
        asPercentage
      />
    );
  }
  return (
    <DataCard>
      <h2>
        <FormattedMessage {...localMessages.title} />
      </h2>
      <p><FormattedMessage {...localMessages.intro} /></p>
      {content}
    </DataCard>
  );
};

PartisanshipStoryCountsPreviewContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  // from state
  counts: PropTypes.array,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.focalSets.create.retweetStoryCounts.fetchStatus,
  counts: state.topics.selected.focalSets.create.retweetStoryCounts.story_counts,
});

const fetchAsyncData = (dispatch, { topicId, year }) => dispatch(fetchCreateFocusRetweetStoryCounts(topicId, year));

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData)(
      PartisanshipStoryCountsPreviewContainer
    )
  )
);
