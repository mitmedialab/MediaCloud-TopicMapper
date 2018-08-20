import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { fetchQuerySplitStoryCount, fetchDemoQuerySplitStoryCount, resetSentenceCounts, setSentenceDataPoint, resetSentenceDataPoint } from '../../../actions/explorerActions';
import withLoginRequired from '../../common/hocs/LoginRequiredDialog';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import composeSummarizedVisualization from './SummarizedVizualization';
import withQueryResults from './QueryResultsSelector';
import AttentionOverTimeChart from '../../vis/AttentionOverTimeChart';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import { oneDayLater, solrFormat } from '../../../lib/dateUtil';
import { postToDownloadUrl, ACTION_MENU_ITEM_CLASS } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import { FETCH_INVALID } from '../../../lib/fetchConstants';

const localMessages = {
  overallSeries: { id: 'explorer.attention.series.overall', defaultMessage: 'Whole Query' },
  lineChartTitle: { id: 'explorer.attention.lineChart.title', defaultMessage: 'Attention Over Time' },
  descriptionIntro: { id: 'explorer.attention.lineChart.intro', defaultMessage: '<p>Compare the attention paid to your queries over time to understand how they are covered. This chart shows the number of stories that match each of your queries. Spikes in attention can reveal key events. Plateaus can reveal stable, "normal", attention levels. Click a point to see words and headlines for those dates. Use the "view options" menu to switch between story counts and a percentage.</p>' },
  descriptionDetail: { id: 'explorer.attention.lineChart.detail', defaultMessage: '<p>This chart includes one line for each query in your search. Each line charts the number of stories that matched your query per day in the sources and collections you have specified.</p><p>Roll over the line chart to see the stories per day in that period of time. Click the download button in the top right to download the raw counts in a CSV spreadsheet. Click the three lines in the top right of the chart to export the chart as an image file.</p>' },
  withKeywords: { id: 'explorer.attention.mode.withkeywords', defaultMessage: 'View Story Count (default)' },
  withoutKeywords: { id: 'explorer.attention.mode.withoutkeywords', defaultMessage: 'View Story Percentage' },
  downloadCsv: { id: 'explorer.attention.downloadCsv', defaultMessage: 'Download { name } stories over time CSV' },
};

const VIEW_NORMALIZED = 'VIEW_NORMALIZED';
const VIEW_REGULAR = 'VIEW_REGULAR';

class QueryAttentionOverTimeResultsContainer extends React.Component {
  state = {
    clickedQuery: null,
    view: VIEW_REGULAR, // which view to show (see view constants above)
  }

  setView = (nextView) => {
    this.setState({ view: nextView });
  }

  handleDataPointClick = (date0, date1, evt, origin) => {
    const { isLoggedIn, selectDataPoint, queries, onShowLoginDialog } = this.props;
    if (isLoggedIn) {
      const name = origin.series.name;
      const currentQueryOfInterest = queries.filter(qry => qry.label === name)[0];
      const dayGap = 1; // TODO: harcoded for now because we are always showing daily results
      // date calculations for span/range
      const clickedQuery = {
        q: currentQueryOfInterest.q,
        start_date: solrFormat(date0),
        color: origin.series.color,
        dayGap,
        sources: currentQueryOfInterest.sources.map(s => s.media_id),
        collections: currentQueryOfInterest.collections.map(c => c.tags_id),
      };
      clickedQuery.end_date = solrFormat(oneDayLater(date1), true);
      this.setState({ clickedQuery });
      selectDataPoint(clickedQuery);
    } else {
      onShowLoginDialog();
    }
  }

  downloadCsv = (query) => {
    postToDownloadUrl('/api/explorer/stories/split-count.csv', query);
  }

  render() {
    const { results, queries } = this.props;
    // stich together bubble chart data

    // because these results are indexed, we can merge these two arrays
    // we may have more results than queries b/c queries can be deleted but not executed
    // so we have to do the following
    const safeResults = results.map((r, idx) => Object.assign({}, r, queries[idx]));
    // stich together line chart data
    let series = [];
    if (safeResults && safeResults.length > 0) {
      series = [
        ...safeResults.map((query, idx) => {    // add series for all the results
          if (query.counts || query.normalizedCounts) {
            let data;
            if (this.state.view === VIEW_NORMALIZED) {
              data = query.counts.map(d => [d.date, d.ratio]);
            } else {
              data = query.counts.map(d => [d.date, d.count]);
            }
            return {
              id: idx,
              name: query.label,
              data,
              color: query.color,
            };
          } return {};
        }),
      ];
    }
    return (
      <div>
        <AttentionOverTimeChart
          series={series}
          height={300}
          backgroundColor="#f5f5f5"
          onDataPointClick={this.handleDataPointClick}
          normalizeYAxis={this.state.view === VIEW_NORMALIZED}
        />
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            {safeResults.map((q, idx) =>
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
            )}
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
          </ActionMenu>
        </div>
      </div>
    );
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
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  daySpread: PropTypes.bool,
  // from mergeProps
  asyncFetch: PropTypes.func.isRequired,
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (queries) => {
    // this should trigger when the user clicks the Search button or changes the URL
    // for n queries, run the dispatch with each parsed query
    dispatch(resetSentenceCounts()); // necessary if a query deletion has occurred
    if (ownProps.isLoggedIn) {
      const runTheseQueries = queries || ownProps.queries;
      runTheseQueries.map((q) => {
        const infoToQuery = {
          start_date: q.startDate,
          end_date: q.endDate,
          q: q.q,
          index: q.index,
          sources: q.sources.map(s => s.id),
          collections: q.collections.map(c => c.id),
        };
        return dispatch(fetchQuerySplitStoryCount(infoToQuery));
      });
    } else if (queries || ownProps.queries) { // else assume DEMO mode, but assume the queries have been loaded
      const runTheseQueries = queries || ownProps.queries;
      runTheseQueries.map((q, index) => {
        const demoInfo = {
          index, // should be same as q.index btw
          search_id: q.searchId, // may or may not have these
          query_id: q.id, // could be undefined
          q: q.q, // only if no query id, means demo user added a keyword
        };
        return dispatch(fetchDemoQuerySplitStoryCount(demoInfo));
      });
    }
  },
  selectDataPoint: (clickedDataPoint) => {
    dispatch(resetSentenceDataPoint());
    dispatch(setSentenceDataPoint(clickedDataPoint));
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    asyncFetch: () => {
      dispatchProps.fetchData(ownProps.queries);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeSummarizedVisualization(localMessages.lineChartTitle, localMessages.descriptionIntro, [localMessages.descriptionDetail, messages.countsVsPercentageHelp])(
        withAsyncFetch(
          withQueryResults(
            withLoginRequired(
              QueryAttentionOverTimeResultsContainer
            )
          )
        )
      )
    )
  );
