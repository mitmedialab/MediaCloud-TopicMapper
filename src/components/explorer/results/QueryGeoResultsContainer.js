import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import composeSummarizedVisualization from './SummarizedVizualization';
import withQueryResults from './QueryResultsSelector';
import GeoChart from '../../vis/GeoChart';
import { fetchDemoQueryGeo, fetchQueryGeo, resetGeo } from '../../../actions/explorerActions';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import messages from '../../../resources/messages';
import { postToDownloadUrl, COVERAGE_REQUIRED } from '../../../lib/explorerUtil';

const localMessages = {
  title: { id: 'explorer.geo.title', defaultMessage: 'Geographic Coverage' },
  help: { id: 'explorer.geo.help',
    defaultMessage: '<p>Sometimes media coverage can differ based on the place being talked about. Digging into the <i>geography</i> of the coverage can provide clues to help you understand the narratives. This heatmap shows you the countries that were most often the focus of stories. Click a country to load an Explorer search showing you how the sources in this collection cover it.</p>' },
  descriptionIntro: { id: 'explorer.geo.help.title', defaultMessage: 'About Geographic Attention' },
  downloadCsv: { id: 'explorer.geo.downloadCsv', defaultMessage: 'Download { name } geographic attention CSV' },
};

class QueryGeoResultsContainer extends React.Component {
  downloadCsv = (query) => {
    postToDownloadUrl('/api/explorer/geography/geography.csv', query);
  }
  render() {
    const { results, intl, queries, handleCountryClick, selectedTabIndex, tabSelector } = this.props;
    const { formatNumber } = intl;
    let content;
    const coverageRatio = results[selectedTabIndex] ? results[selectedTabIndex].coverage_percentage : 0;
    if (coverageRatio > COVERAGE_REQUIRED) {
      const data = results[selectedTabIndex].results.map(item => ({ ...item, value: item.pct }));
      content = (
        <div>
          {results[selectedTabIndex] &&
            <GeoChart
              data={data}
              countryMaxColorScale={queries[selectedTabIndex].color}
              hideLegend
              onCountryClick={handleCountryClick}
              backgroundColor="#f5f5f5"
            />
          }
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
    return (
      <div>
        { tabSelector }
        { content }
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <MenuItem
              className="action-icon-menu-item"
              onClick={() => this.downloadCsv(queries[selectedTabIndex])}
            >
              <ListItemText>
                <FormattedMessage {...localMessages.downloadCsv} values={{ name: queries[selectedTabIndex].label }} />
              </ListItemText>
              <ListItemIcon>
                <DownloadButton />
              </ListItemIcon>
            </MenuItem>
          </ActionMenu>
        </div>
      </div>
    );
  }

}

QueryGeoResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  onQueryModificationRequested: PropTypes.func.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  fetchData: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  handleCountryClick: PropTypes.func.isRequired,
  // from mergeProps
  asyncFetch: PropTypes.func.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  tabSelector: PropTypes.object.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  fetchStatus: state.explorer.geo.fetchStatus,
  results: state.explorer.geo.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleCountryClick: (evt, data) => {
    const countryQueryClause = `tags_id_stories:${data.tags_id}`;
    ownProps.onQueryModificationRequested(countryQueryClause);
  },
  fetchData: (queries) => {
    /* this should trigger when the user clicks the Search button or changes the URL
     for n queries, run the dispatch with each parsed query
    */
    dispatch(resetGeo());
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
        return dispatch(fetchQueryGeo(infoToQuery));
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
        return dispatch(fetchDemoQueryGeo(demoInfo)); // id
      });
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
      composeSummarizedVisualization(localMessages.title, localMessages.help, [messages.heatMapHelpText])(
        withAsyncFetch(
          withQueryResults(
            QueryGeoResultsContainer
          )
        )
      )
    )
  );
