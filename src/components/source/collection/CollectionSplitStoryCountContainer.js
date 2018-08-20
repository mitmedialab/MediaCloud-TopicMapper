import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import { fetchCollectionSplitStoryCount } from '../../../actions/sourceActions';
import DataCard from '../../common/DataCard';
import AttentionOverTimeChart from '../../vis/AttentionOverTimeChart';
import { getBrandDarkColor } from '../../../styles/colors';
import messages from '../../../resources/messages';
import ActionMenu from '../../common/ActionMenu';
import withHelp from '../../common/hocs/HelpfulContainer';
import { DownloadButton } from '../../common/IconButton';
import { urlToExplorerQuery } from '../../../lib/urlUtil';
import { VIEW_REGULARLY_COLLECTED, VIEW_ALL_STORIES } from '../../../lib/mediaUtil';

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
  regularlyCollectedStories: { id: 'explorer.attention.series.regular', defaultMessage: 'Regularly Collected Stories over the last year (default)' },
  allStories: { id: 'explorer.attention.series.allstories', defaultMessage: 'All Stories' },
};

class CollectionSplitStoryCountContainer extends React.Component {
  state = {
    storyCollection: VIEW_REGULARLY_COLLECTED,
  }
  onIncludeSpidered = (d) => {
    this.setState({ storyCollection: d });  // reset this to trigger a re-render
  }
  downloadCsv = () => {
    const { collectionId } = this.props;
    const url = `/api/collections/${collectionId}/story-split/count.csv`;
    window.location = url;
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
    const { allStories, partialStories, intl, filename, helpButton, collectionName } = this.props;
    const { formatMessage, formatNumber } = intl;
    let stories = partialStories;
    let title = localMessages.partialTitle;
    if (this.state.storyCollection === VIEW_ALL_STORIES) {
      stories = allStories;
      title = localMessages.allTitle;
    }
    return (
      <DataCard>
        <div className="actions">
          <ActionMenu>
            <MenuItem
              className="action-icon-menu-item"
              onTouchTap={this.downloadCsv}
            >
              <ListItemText><FormattedMessage {...messages.downloadCSV} /></ListItemText>
              <ListItemIcon><DownloadButton /></ListItemIcon>
            </MenuItem>
            <MenuItem
              className="action-icon-menu-item"
              disabled={this.state.storyCollection === VIEW_REGULARLY_COLLECTED}
              onClick={() => this.onIncludeSpidered(VIEW_REGULARLY_COLLECTED)}
            >
              <FormattedMessage {...localMessages.regularlyCollectedStories} />
            </MenuItem>
            <MenuItem
              className="action-icon-menu-item"
              disabled={this.state.storyCollection === VIEW_ALL_STORIES}
              onClick={() => this.onIncludeSpidered(VIEW_ALL_STORIES)}
            >
              <FormattedMessage {...localMessages.allStories} />
            </MenuItem>
          </ActionMenu>
        </div>
        <h2>
          <FormattedMessage {...title} />
          {helpButton}
        </h2>
        <AttentionOverTimeChart
          total={stories.total}
          series={[{
            id: 0,
            name: collectionName,
            color: getBrandDarkColor(),
            data: stories.list.map(c => [c.date, c.count]),
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
  // from dispatch
  asyncFetch: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  helpButton: PropTypes.node.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.collections.selected.collectionSplitStoryCount.fetchStatus,
  allStories: state.sources.collections.selected.collectionSplitStoryCount.all_stories,
  partialStories: state.sources.collections.selected.collectionSplitStoryCount.partial_stories,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  asyncFetch: () => {
    dispatch(fetchCollectionSplitStoryCount(ownProps.collectionId, { separate_spidered: true }));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      withHelp(localMessages.helpTitle, [localMessages.helpText, messages.attentionChartHelpText])(
        withAsyncFetch(
          CollectionSplitStoryCountContainer
        )
      )
    )
  );
