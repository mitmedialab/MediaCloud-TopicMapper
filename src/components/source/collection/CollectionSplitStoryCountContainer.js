import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { fetchPlatformCountOverTime } from '../../../actions/platformActions';
import DataCard from '../../common/DataCard';
import AttentionOverTimeChart, { dataAsSeries, downloadData } from '../../vis/AttentionOverTimeChart';
import { getBrandDarkColor } from '../../../styles/colors';
import messages from '../../../resources/messages';
import ActionMenu from '../../common/ActionMenu';
import withAttentionAggregation from '../../common/hocs/AttentionAggregation';
import withHelp from '../../common/hocs/HelpfulContainer';
import { DownloadButton } from '../../common/IconButton';
import { urlToExplorerQuery } from '../../../lib/urlUtil';
import { VIEW_REGULARLY_COLLECTED, VIEW_ALL_STORIES } from '../../../lib/mediaUtil';
import { PAST_WEEK } from '../../../lib/dateUtil';
import { TAG_SPIDERED_STORY } from '../../../lib/tagUtil';

const localMessages = {
  partialTitle: { id: 'sentenceCount.title', defaultMessage: 'Last Year of Coverage (regularly collected stories)' },
  allTitle: { id: 'sentenceCount.title', defaultMessage: 'Last Year of Coverage (all stories)' },
  helpTitle: { id: 'collection.summary.splitCount.help.title', defaultMessage: 'About Stories Over Time' },
  helpText: { id: 'collection.summary.splitCount.help.text',
    defaultMessage: '<p>This chart shows you the number of stories we have collected from the sources in this collection over the last year. Some stories are collected regularly from RSS feeds associated with the media source, while others are discovered via tracing through links in other stories (ie. spidering).</p>',
  },
  introText: { id: 'chart.storiesOverTime.totalCount',
    defaultMessage: 'We have collected {total, plural, =0 {No stories} one {One story} other {{formattedTotal} stories}} from sources in the "{collectionName}" collection in the last year.',
  },
  regularlyCollectedStories: { id: 'explorer.attention.series.regular', defaultMessage: 'Regularly collected stories over the last year (default)' },
  allStories: { id: 'explorer.attention.series.allstories', defaultMessage: 'All stories over the last year' },
};

class CollectionSplitStoryCountContainer extends React.Component {
  state = {
    viewMode: VIEW_REGULARLY_COLLECTED,
  }

  onIncludeSpidered = (d) => {
    this.setState({ viewMode: d }); // reset this to trigger a re-render
  }

  downloadCsv = () => {
    // generate and download client side
    const { collectionId, allStories, partialStories } = this.props;
    const data = (this.state.viewMode === VIEW_ALL_STORIES) ? allStories : partialStories;
    const prefix = (this.state.viewMode === VIEW_ALL_STORIES) ? 'all' : 'regularly-collected';
    const filename = `collection-${collectionId}-${prefix}-attention.csv`;
    downloadData(filename, data.counts);
  }

  handleDataPointClick = (startDate, endDate) => {
    const { collectionName, collectionId } = this.props;
    const startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
    const endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
    const url = urlToExplorerQuery(`${collectionName} on ${startDateStr}`, '*', [], [collectionId],
      startDateStr, endDateStr);
    window.open(url, '_blank');
  }

  render() {
    const { allStories, partialStories, intl, filename, helpButton, collectionName,
      attentionAggregationMenuItems, selectedTimePeriod } = this.props;
    const { formatMessage, formatNumber } = intl;
    let stories = partialStories;
    let title = localMessages.partialTitle;
    if (this.state.viewMode === VIEW_ALL_STORIES) {
      stories = allStories;
      title = localMessages.allTitle;
    }
    return (
      <DataCard>
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <MenuItem
              className="action-icon-menu-item"
              onClick={this.downloadCsv}
            >
              <ListItemText><FormattedMessage {...messages.downloadCSV} /></ListItemText>
              <ListItemIcon><DownloadButton /></ListItemIcon>
            </MenuItem>
          </ActionMenu>
          <ActionMenu actionTextMsg={messages.viewOptions}>
            <MenuItem
              className="action-icon-menu-item"
              disabled={this.state.storyMode === VIEW_REGULARLY_COLLECTED}
              onClick={() => this.onIncludeSpidered(VIEW_REGULARLY_COLLECTED)}
            >
              <FormattedMessage {...localMessages.regularlyCollectedStories} />
            </MenuItem>
            <MenuItem
              className="action-icon-menu-item"
              disabled={this.state.storyMode === VIEW_ALL_STORIES}
              onClick={() => this.onIncludeSpidered(VIEW_ALL_STORIES)}
            >
              <FormattedMessage {...localMessages.allStories} />
            </MenuItem>
            <Divider />
            {attentionAggregationMenuItems}
          </ActionMenu>
        </div>
        <h2>
          <FormattedMessage {...title} />
          {helpButton}
        </h2>
        <AttentionOverTimeChart
          total={stories.total}
          series={[{
            ...dataAsSeries(stories.counts),
            id: 0,
            name: collectionName,
            color: getBrandDarkColor(),
            showInLegend: false,
          }]}
          introText={formatMessage(localMessages.introText, {
            total: stories.total,
            formattedTotal: formatNumber(stories.total),
            collectionName,
          })}
          height={250}
          filename={filename}
          onDataPointClick={this.handleDataPointClick}
          interval={selectedTimePeriod}
        />
      </DataCard>
    );
  }
}

CollectionSplitStoryCountContainer.propTypes = {
  // from state
  fetchStatus: PropTypes.string.isRequired,
  allStories: PropTypes.object,
  partialStories: PropTypes.object,
  // from parent
  collectionId: PropTypes.number.isRequired,
  collectionName: PropTypes.string.isRequired,
  filename: PropTypes.string,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  attentionAggregationMenuItems: PropTypes.array.isRequired,
  selectedTimePeriod: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.platforms.countOverTime.fetchStatus,
  allStories: state.platforms.countOverTime.results.collectionTotal,
  partialStories: state.platforms.countOverTime.results.collectionNonSpidered,
});

const fetchAsyncData = (dispatch, { collectionId }) => {
  // grab all results
  dispatch(fetchPlatformCountOverTime({ uid: 'collectionTotal', platform_query: `tags_id_media:${collectionId}` }));
  // and also grab just the non-spidered stories
  dispatch(fetchPlatformCountOverTime({ uid: 'collectionNonSpidered', platform_query: `tags_id_media:${collectionId} AND NOT tags_id_stories:${TAG_SPIDERED_STORY}` }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAttentionAggregation(
      withHelp(localMessages.helpTitle, [localMessages.helpText, messages.attentionChartHelpText])(
        withAsyncData(fetchAsyncData)(
          CollectionSplitStoryCountContainer
        ),
      ),
      PAST_WEEK,
    )
  )
);
