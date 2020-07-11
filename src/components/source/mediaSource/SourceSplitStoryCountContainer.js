import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { getBrandDarkColor } from '../../../styles/colors';
import withAttentionAggregation from '../../common/hocs/AttentionAggregation';
import withAsyncData from '../../common/hocs/AsyncDataContainer';
import { fetchPlatformCountOverTime } from '../../../actions/platformActions';
import DataCard from '../../common/DataCard';
import AttentionOverTimeChart, { dataAsSeries, downloadData } from '../../vis/AttentionOverTimeChart';
import messages from '../../../resources/messages';
import withHelp from '../../common/hocs/HelpfulContainer';
import ActionMenu from '../../common/ActionMenu';
import { DownloadButton } from '../../common/IconButton';
import { urlToExplorerQuery } from '../../../lib/urlUtil';
import { VIEW_REGULARLY_COLLECTED, VIEW_ALL_STORIES } from '../../../lib/mediaUtil';
import { PAST_WEEK } from '../../../lib/dateUtil';
import { TAG_SPIDERED_STORY } from '../../../lib/tagUtil';

const localMessages = {
  partialTitle: { id: 'source.summary.splitCount.title', defaultMessage: 'Volume of Stories Over Time (regularly collected stories)' },
  allTitle: { id: 'source.summary.splitCount.title', defaultMessage: 'Volume of Stories Over Time (all stories)' },
  helpTitle: { id: 'source.summary.splitCount.help.title', defaultMessage: 'About Stories Over Time' },
  helpText: { id: 'source.summary.splitCount.help.text',
    defaultMessage: '<p>This chart shows you the number of stories we have collected from this source over time. Some stories are collected regularly from RSS feeds associated with the media source, while others are discovered via tracing through links in other stories (ie. spidering). Click on the line to see a summary of the content in this source for that date. The grey vertical lines indicate weeks where we didn\'t get as many stories as we\'d expect to.</p>',
  },
  regularlyCollectedStories: { id: 'explorer.attention.series.regular', defaultMessage: 'Regularly Collected Stories (default)' },
  allStories: { id: 'explorer.attention.series.allstories', defaultMessage: 'All Stories' },
};

class SourceSplitStoryCountContainer extends React.Component {
  state = {
    viewMode: VIEW_REGULARLY_COLLECTED,
  }

  onIncludeSpidered = (d) => {
    this.setState({ viewMode: d }); // reset this to trigger a re-render
  }

  handleDataPointClick = (startDate, endDate) => {
    const { sourceId, sourceName } = this.props;
    const startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
    const endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
    const url = urlToExplorerQuery(sourceName, '*', [sourceId], [], startDateStr, endDateStr);
    window.open(url, '_blank');
  }

  downloadCsv = () => {
    // generate and download client side
    const { sourceId, allStories, partialStories } = this.props;
    const data = (this.state.viewMode === VIEW_ALL_STORIES) ? allStories : partialStories;
    const prefix = (this.state.viewMode === VIEW_ALL_STORIES) ? 'all' : 'regularly-collected';
    const filename = `source-${sourceId}-${prefix}-attention.csv`;
    downloadData(filename, data.counts);
  }

  render() {
    const { allStories, partialStories, filename, helpButton, sourceName, attentionAggregationMenuItems, selectedTimePeriod } = this.props;
    let stories = partialStories;
    let title = localMessages.partialTitle;
    if (this.state.viewMode === VIEW_ALL_STORIES) {
      stories = allStories;
      title = localMessages.allTitle;
    }
    return (
      <DataCard>
        <div className="action-menu-set">
          <div className="actions">
            <ActionMenu actionTextMsg={messages.viewOptions}>
              <MenuItem
                className="action-icon-menu-item"
                disabled={this.state.viewMode === VIEW_REGULARLY_COLLECTED}
                onClick={() => this.onIncludeSpidered(VIEW_REGULARLY_COLLECTED)}
              >
                <FormattedMessage {...localMessages.regularlyCollectedStories} />
              </MenuItem>
              <MenuItem
                className="action-icon-menu-item"
                disabled={this.state.viewMode === VIEW_ALL_STORIES}
                onClick={() => this.onIncludeSpidered(VIEW_ALL_STORIES)}
              >
                <FormattedMessage {...localMessages.allStories} />
              </MenuItem>
              <Divider />
              {attentionAggregationMenuItems}
            </ActionMenu>
            <ActionMenu actionTextMsg={messages.downloadOptions}>
              <MenuItem
                className="action-icon-menu-item"
                onClick={this.downloadCsv}
              >
                <ListItemText><FormattedMessage {...messages.downloadCSV} /></ListItemText>
                <ListItemIcon><DownloadButton /></ListItemIcon>
              </MenuItem>
            </ActionMenu>
          </div>
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
            name: sourceName,
            color: getBrandDarkColor(),
            showInLegend: false,
          }]}
          height={250}
          filename={filename}
          onDataPointClick={this.handleDataPointClick}
          interval={selectedTimePeriod}
        />
      </DataCard>
    );
  }
}

SourceSplitStoryCountContainer.propTypes = {
  // from state
  fetchStatus: PropTypes.string.isRequired,
  allStories: PropTypes.object,
  partialStories: PropTypes.object,
  // from parent
  sourceId: PropTypes.number.isRequired,
  sourceName: PropTypes.string.isRequired,
  filename: PropTypes.string,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
  attentionAggregationMenuItems: PropTypes.array.isRequired,
  selectedTimePeriod: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.platforms.countOverTime.fetchStatus,
  allStories: state.platforms.countOverTime.results.sourceTotal,
  partialStories: state.platforms.countOverTime.results.sourceNonSpidered,
});

const fetchAsyncData = (dispatch, { sourceId }) => {
  // grab all results
  dispatch(fetchPlatformCountOverTime({ uid: 'sourceTotal', platform_query: `media_id:${sourceId}` }));
  // and also grab just the non-spidered stories
  dispatch(fetchPlatformCountOverTime({ uid: 'sourceNonSpidered', platform_query: `media_id:${sourceId} AND NOT tags_id_stories:${TAG_SPIDERED_STORY}` }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withAttentionAggregation(
      withHelp(localMessages.helpTitle, [localMessages.helpText, messages.attentionChartHelpText])(
        withAsyncData(fetchAsyncData)(
          SourceSplitStoryCountContainer
        )
      ),
      PAST_WEEK,
    )
  )
);
