import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { fetchQuerySplitStoryCount, setSentenceDataPoint, resetSentenceDataPoint } from '../../../actions/explorerActions';
import withLoginRequired from '../../common/hocs/LoginRequiredDialog';
import withAttentionAggregation from '../../common/hocs/AttentionAggregation';
import withSummary from '../../common/hocs/SummarizedVizualization';
import withQueryResults from './QueryResultsSelector';
import AttentionOverTimeChart, { dataAsSeries } from '../../vis/AttentionOverTimeChart';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import { oneDayLater, solrFormat } from '../../../lib/dateUtil';
import { postToDownloadUrl, postToCombinedDownloadUrl, ACTION_MENU_ITEM_CLASS, ensureSafeResults, serializeSearchTags } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import { FETCH_INVALID } from '../../../lib/fetchConstants';

const localMessages = {
  overallSeries: { id: 'explorer.attention.series.overall', defaultMessage: 'Whole Query' },
  lineChartTitle: { id: 'explorer.attention.lineChart.title', defaultMessage: 'Attention Over Time' },
  descriptionIntro: { id: 'explorer.attention.lineChart.intro', defaultMessage: '<p>Compare the attention paid to your queries over time to understand how they are covered. This chart shows the number of stories that match each of your queries. Spikes in attention can reveal key events. Plateaus can reveal stable, "normal", attention levels. Click a point to see words and headlines for those dates. Use the "view options" menu to switch between story counts and a percentage.</p>' },
  descriptionDetail: { id: 'explorer.attention.lineChart.detail', defaultMessage: '<p>This chart includes one line for each query in your search. Each line charts the number of stories that matched your query per day in the sources and collections you have specified.</p><p>Roll over the line chart to see the stories per day in that period of time. Click the download button in the top right to download the raw counts in a CSV spreadsheet. Click the three lines in the top right of the chart to export the chart as an image file.</p>' },
  withKeywords: { id: 'explorer.attention.mode.withkeywords', defaultMessage: 'View Story Count (default)' },
  withoutKeywords: { id: 'explorer.attention.mode.withoutkeywords', defaultMessage: 'View Normalized Story Percentage' },
  downloadCsv: { id: 'explorer.attention.downloadCsv', defaultMessage: 'Download { name } story count over time CSV' },
  downloadAllCsv: { id: 'explorer.attention.downloadAllCsv', defaultMessage: 'Download all story counts over time CSV' },
};

const VIEW_NORMALIZED = 'VIEW_NORMALIZED';
const VIEW_REGULAR = 'VIEW_REGULAR';

class QueryAttentionOverTimeResultsContainer extends React.Component {
  state = {
    view: VIEW_REGULAR, // which view to show (see view constants above)
  }

  setView = (nextView) => {
    this.setState({ view: nextView });
  }

  handleDataPointClick = (startDate, endDate, evt, chartObj, point0x, point1x, pointValue) => {
    const { isLoggedIn, selectDataPoint, queries, onShowLoginDialog } = this.props;
    if (isLoggedIn) {
      const { name } = chartObj.series;
      const currentQueryOfInterest = queries.filter(qry => qry.label === name)[0];
      const dayGap = 1; // TODO: harcoded for now because we are always showing daily results
      // date calculations for span/range
      const dataPoint = {
        q: currentQueryOfInterest.q,
        start_date: solrFormat(startDate),
        color: chartObj.series.color,
        dayGap,
        sources: currentQueryOfInterest.sources.map(s => s.media_id),
        collections: currentQueryOfInterest.collections.map(c => c.tags_id),
        searches: serializeSearchTags(currentQueryOfInterest.searches), // for each query, go prep searches
      };
      dataPoint.end_date = solrFormat(oneDayLater(endDate), true);
      selectDataPoint({ dataPoint, point0x, pointValue });
    } else {
      onShowLoginDialog();
    }
  }

  downloadCsv = (query) => {
    postToDownloadUrl('/api/explorer/stories/split-count.csv', query);
  }

  downloadAllQueriesCsv = (queries) => {
    postToCombinedDownloadUrl('/api/explorer/stories/split-count-all.csv', queries);
  }

  render() {
    const { results, queries, selectedTimePeriod } = this.props;
    // stich together bubble chart data

    // because these results are indexed, we can merge these two arrays
    // we may have more results than queries b/c queries can be deleted but not executed
    // so we have to do the following

    let series = [];
    const safeResults = ensureSafeResults(queries, results);
    if (safeResults) {
      series = [
        ...safeResults.map((query, idx) => { // add series for all the results
          if (query.results && (query.results.counts || query.results.normalizedCounts)) {
            let data;
            if (this.state.view === VIEW_NORMALIZED) {
              data = dataAsSeries(query.results.counts, 'ratio');
            } else {
              data = dataAsSeries(query.results.counts);
            }
            return {
              id: idx,
              name: query.label,
              ...data,
              color: query.color,
            };
          } return {};
        }),
      ];
      return (
        <>
          <AttentionOverTimeChart
            series={series}
            height={300}
            backgroundColor="#f5f5f5"
            onDataPointClick={this.handleDataPointClick}
            normalizeYAxis={this.state.view === VIEW_NORMALIZED}
            interval={selectedTimePeriod}
          />
          <div className="actions">
            <ActionMenu actionTextMsg={messages.downloadOptions}>
              {safeResults.map((q, idx) => (
                <MenuItem
                  key={idx}
                  className={ACTION_MENU_ITEM_CLASS}
                  onClick={() => this.downloadCsv(q)}
                >
                  <ListItemText>
                    <FormattedMessage {...localMessages.downloadCsv} values={{ name: q.label }} />
                  </ListItemText>
                  <ListItemIcon>
                    <DownloadButton />
                  </ListItemIcon>
                </MenuItem>
              ))}
              <MenuItem
                key="all"
                className={ACTION_MENU_ITEM_CLASS}
                onClick={() => this.downloadAllQueriesCsv(queries)}
              >
                <ListItemText>
                  <FormattedMessage {...localMessages.downloadAllCsv} />
                </ListItemText>
                <ListItemIcon>
                  <DownloadButton />
                </ListItemIcon>
              </MenuItem>
            </ActionMenu>
            <ActionMenu actionTextMsg={messages.viewOptions}>
              <MenuItem
                className={ACTION_MENU_ITEM_CLASS}
                disabled={this.state.view === VIEW_REGULAR}
                onClick={() => this.setView(VIEW_REGULAR)}
              >
                <ListItemText>
                  <FormattedMessage {...localMessages.withKeywords} />
                </ListItemText>
              </MenuItem>
              <MenuItem
                className={ACTION_MENU_ITEM_CLASS}
                disabled={this.state.view === VIEW_NORMALIZED}
                onClick={() => this.setView(VIEW_NORMALIZED)}
              >
                <ListItemText>
                  <FormattedMessage {...localMessages.withoutKeywords} />
                </ListItemText>
              </MenuItem>
              <Divider />
              {this.props.attentionAggregationMenuItems}
            </ActionMenu>
          </div>
        </>
      );
    }
    return <div>Error</div>;
  }
}

QueryAttentionOverTimeResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from hocs
  intl: PropTypes.object.isRequired,
  onShowLoginDialog: PropTypes.func.isRequired,
  attentionAggregationMenuItems: PropTypes.array.isRequired,
  selectedTimePeriod: PropTypes.string.isRequired,
  // from dispatch
  results: PropTypes.object.isRequired,
  daySpread: PropTypes.bool,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  selectDataPoint: PropTypes.func.isRequired,
  tabSelector: PropTypes.object,
  selectedTabIndex: PropTypes.number,

};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  fetchStatus: state.explorer.storySplitCount.fetchStatus || FETCH_INVALID,
  results: state.explorer.storySplitCount.results,
});

const mapDispatchToProps = dispatch => ({
  selectDataPoint: (clickedDataPoint) => {
    dispatch(resetSentenceDataPoint());
    dispatch(setSentenceDataPoint(clickedDataPoint));
  },

});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return { ...stateProps,
    ...dispatchProps,
    ...ownProps,
    shouldUpdate: (nextProps) => { // QueryResultsSelector needs to ask the child for internal repainting
      const { selectedTimePeriod } = stateProps;
      return nextProps.selectedTimePeriod !== selectedTimePeriod;
    } };
}

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps, mergeProps)(
    withSummary(localMessages.lineChartTitle, localMessages.descriptionIntro, [localMessages.descriptionDetail, messages.countsVsPercentageHelp])(
      withAttentionAggregation(
        withQueryResults(fetchQuerySplitStoryCount)(
          withLoginRequired(
            QueryAttentionOverTimeResultsContainer
          )
        )
      )
    )
  )
);
