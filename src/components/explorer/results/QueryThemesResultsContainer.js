import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import withSummary from '../../common/hocs/SummarizedVizualization';
import withUpdatingQuery from '../../common/hocs/UpdateQueryContainer';
import withLoginRequired from '../../common/hocs/LoginRequiredDialog';
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
  onThemeSelection = (selectedTheme) => {
    const { openUpdateQueryDialog, isLoggedIn, onShowLoginDialog } = this.props;
    if (isLoggedIn) {
      const queryClauseToAdd = ` tags_id_stories:${selectedTheme.tags_id}`;
      openUpdateQueryDialog(queryClauseToAdd, selectedTheme.name);
    } else {
      onShowLoginDialog();
    }
  }

  downloadCsv = (query) => {
    postToDownloadUrl(`/api/explorer/tags/${TAG_SET_NYT_THEMES}/top-tags.csv`, query);
  }


  render() {
    const { results, queries, selectedQuery, selectedTabIndex, tabSelector } = this.props;
    const { formatNumber } = this.props.intl;
    let rawData = [];
    let content = null;
    const selectedResults = results[selectedQuery.uid];
    if (selectedResults) {
      rawData = selectedResults.results;
      const coverageRatio = selectedResults.coverage_percentage;
      if (coverageRatio > COVERAGE_REQUIRED) {
        const data = rawData.slice(0, 4).map((info, idx) => ({
          value: info.pct, // info.count,
          fill: mapD3Top10Colors(idx),
          aboveText: (idx % 2 === 0) ? info.label : null,
          belowText: (idx % 2 !== 0) ? info.label : null,
          name: info.label,
          rolloverText: `${info.label}: ${formatNumber(info.pct, { style: 'percent', maximumFractionDigits: 2 })}`,
          tags_id: info.tags_id,
        }));
        content = (
          <div>
            <BubbleRowChart
              data={data}
              maxBubbleRadius={60}
              domId={BUBBLE_CHART_DOM_ID}
              width={650}
              padding={0}
              onBubbleClick={this.onThemeSelection}
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
              downloadCsv={() => this.downloadCsv(queries[selectedTabIndex])}
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
  selectedQuery: PropTypes.object.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  onShowLoginDialog: PropTypes.func.isRequired,
  openUpdateQueryDialog: PropTypes.func.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  results: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topThemes.fetchStatus,
  results: state.explorer.topThemes.results,
});

export default
injectIntl(
  connect(mapStateToProps)(
    withSummary(localMessages.title, localMessages.helpIntro, [localMessages.helpDetail, messages.nytThemeHelpDetails])(
      withQueryResults(resetThemes, fetchTopThemes, fetchDemoTopThemes)(
        withLoginRequired(
          withUpdatingQuery(
            QueryThemesResultsContainer
          )
        )
      )
    )
  )
);
