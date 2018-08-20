import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import composeSummarizedVisualization from './SummarizedVizualization';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import ActionMenu from '../../common/ActionMenu';
import SVGAndCSVMenu from '../../common/SVGAndCSVMenu';
import { resetThemes, fetchTopThemes, fetchDemoTopThemes } from '../../../actions/explorerActions';
import { postToDownloadUrl, downloadExplorerSvg, COVERAGE_REQUIRED } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import withQueryResults from './QueryResultsSelector';
import { TAG_SET_NYT_THEMES } from '../../../lib/tagUtil';
import mapD3Top10Colors from '../../../lib/colorUtil';
import BubbleRowChart from '../../vis/BubbleRowChart';

const BUBBLE_CHART_DOM_ID = 'explorer-nyt-theme-chart';

const localMessages = {
  title: { id: 'explorer.themes.title', defaultMessage: 'Top Themes' },
  helpIntro: { id: 'explorer.themes.help.intro', defaultMessage: '<p>News coverage can be grouped into themes to identify the differing narratives.  This chart shows you how many stories match a fixed list of themes we detect in stories.</p>' },
  helpDetail: { id: 'explorer.themes.help.detail', defaultMessage: '<p>The larger the color circled, the more prominent it is in the stories that matched your query. The grey circle represents all the stories matching your query. The colored circle in the center represents the number of stories found that match each particular theme.</p>' },
  downloadCsv: { id: 'explorer.themes.downloadCsv', defaultMessage: 'Download { name } NYT themes CSV' },
  downloadSvg: { id: 'explorer.themes.downloadSvg', defaultMessage: 'Download { name } NYT themes SVG' },
};

class QueryThemesResultsContainer extends React.Component {
  downloadCsv = (query) => {
    postToDownloadUrl(`/api/explorer/tags/${TAG_SET_NYT_THEMES}/top-tags.csv`, query);
  }
  render() {
    const { results, queries, handleThemeClicked, selectedTabIndex, tabSelector } = this.props;
    const { formatNumber } = this.props.intl;
    let rawData = [];
    let content = null;
    if (results) {
      rawData = results[selectedTabIndex] ? results[selectedTabIndex].results : [];
      const coverageRatio = results[selectedTabIndex] ? results[selectedTabIndex].coverage_percentage : 0;
      if (coverageRatio > COVERAGE_REQUIRED) {
        const data = rawData.slice(0, 4).map((info, idx) => ({
          value: info.pct, // info.count,
          fill: mapD3Top10Colors(idx),
          aboveText: (idx % 2 === 0) ? info.label : null,
          belowText: (idx % 2 !== 0) ? info.label : null,
          rolloverText: `${info.label}: ${formatNumber(info.pct, { style: 'percent', maximumFractionDigits: 2 })}`,
        }));
        content = (
          <div>
            <BubbleRowChart
              data={data}
              maxBubbleRadius={60}
              domId={BUBBLE_CHART_DOM_ID}
              width={650}
              padding={0}
              onClick={handleThemeClicked}
              asPercentage
              minCutoffValue={0.05}
            />
          </div>
        );
      } else {
        content = (
          <p>
            <FormattedHTMLMessage
              {...messages.notEnoughCoverage}
              values={{ pct: formatNumber(coverageRatio, { style: 'percent', maximumFractionDigits: 2 }) }}
            />
          </p>
        );
      }
    }
    return (
      <div>
        { tabSelector }
        { content }
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <SVGAndCSVMenu
              downloadCsv={() => this.downloadCsv(queries[selectedTabIndex].label)}
              downloadSvg={() => downloadExplorerSvg(queries[selectedTabIndex].label, 'sampled-nyt_themes', BUBBLE_CHART_DOM_ID)}
              label={queries[selectedTabIndex].label}
            />
          </ActionMenu>
        </div>
      </div>
    );
  }
}

QueryThemesResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  // from mergeProps
  asyncFetch: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  handleThemeClicked: PropTypes.func.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  fetchStatus: state.explorer.topThemes.fetchStatus,
  results: state.explorer.topThemes.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (queries) => {
    // this should trigger when the user clicks the Search button or changes the URL
    // for n queries, run the dispatch with each parsed query
    dispatch(resetThemes());
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
        return dispatch(fetchTopThemes(infoToQuery));
      });
    } else if (queries || ownProps.queries) { // else assume DEMO mode, but assume the queries have been loaded
      const runTheseQueries = queries || ownProps.queries;
      runTheseQueries.map((q, index) => {
        const demoInfo = {
          index, // should be same as q.index btw
          search_id: q.searchId, // may or may not have these
          query_id: q.id,
          q: q.q, // only if no query id, means demo user added a keyword
        };
        return dispatch(fetchDemoTopThemes(demoInfo)); // id
      });
    }
  },
  handleThemeClicked: (entity, isCannedSearch) => {
    const queryClauseToAdd = ` tags_id_stories:${entity}`;
    if (isCannedSearch === undefined) {
      ownProps.onQueryModificationRequested(queryClauseToAdd);
    }
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
      composeSummarizedVisualization(localMessages.title, localMessages.helpIntro, [localMessages.helpDetail, messages.nytThemeHelpDetails])(
        withAsyncFetch(
          withQueryResults(
            QueryThemesResultsContainer
          )
        )
      )
    )
  );
