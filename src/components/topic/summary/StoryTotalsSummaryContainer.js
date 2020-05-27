import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ActionMenu from '../../common/ActionMenu';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { fetchTopicStoryCounts } from '../../../actions/topicActions';
import BubbleRowChart from '../../vis/BubbleRowChart';
import { DownloadButton } from '../../common/IconButton';
import { topicDownloadFilename } from '../../util/topicUtil';
import { getBrandDarkColor } from '../../../styles/colors';
import messages from '../../../resources/messages';
import { downloadSvg } from '../../util/svg';

const BUBBLE_CHART_DOM_ID = 'bubble-chart-story-total';

const localMessages = {
  title: { id: 'topic.summary.storyTotals.title', defaultMessage: 'Filtered Story Count' },
  descriptionIntro: { id: 'topic.summary.storyTotals.help.title',
    defaultMessage: '<p>Any filters you choose to apply will focus in on a smaller set of the stories within this topic.  Here you can see how many stories you are looking at, from the total stories within the topic.</p>',
  },
  description: { id: 'topic.summary.storyTotals.help.into',
    defaultMessage: '<p>This bubble chart shows you how many stories from this Topic are included in the filters you have selected.  The "filtered" bubble is the number of stories included in your filters.  The "Total" bubble is the total stories within this topic.</p>',
  },
  filteredLabel: { id: 'topic.summary.storyTotals.filtered', defaultMessage: 'Filtered' },
  totalLabel: { id: 'topic.summary.storyTotals.total', defaultMessage: 'Total' },
};

const StoryTotalsSummaryContainer = (props) => {
  const { counts, topicName, filters } = props;
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
      />
    );
  }
  return (
    <>
      {content}
      <div className="actions">
        <ActionMenu actionTextMsg={messages.downloadOptions}>
          <MenuItem
            className="action-icon-menu-item"
            onClick={() => downloadSvg(`${topicDownloadFilename(topicName, filters)}-filtered-story-count`, BUBBLE_CHART_DOM_ID)}
          >
            <ListItemText><FormattedMessage {...messages.downloadSVG} /></ListItemText>
            <ListItemIcon><DownloadButton /></ListItemIcon>
          </MenuItem>
        </ActionMenu>
      </div>
    </>
  );
};

StoryTotalsSummaryContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  topicName: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
  // from state
  counts: PropTypes.object,
  fetchStatus: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.summary.storyTotals.fetchStatus,
  counts: state.topics.selected.summary.storyTotals.counts,
  filters: state.topics.selected.filters,
});

const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicStoryCounts(props.topicId, props.filters));

export default
injectIntl(
  connect(mapStateToProps)(
    withSummary(localMessages.title, localMessages.descriptionIntro, localMessages.description)(
      withFilteredAsyncData(fetchAsyncData)(
        StoryTotalsSummaryContainer
      )
    )
  )
);
