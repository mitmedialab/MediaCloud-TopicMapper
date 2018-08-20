import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import composeSummarizedVisualization from './SummarizedVizualization';
import withAsyncFetch from '../../common/hocs/AsyncContainer';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import EntitiesTable from '../../common/EntitiesTable';
import { resetEntitiesOrgs, fetchTopEntitiesOrgs, fetchDemoTopEntitiesOrgs } from '../../../actions/explorerActions';
import { postToDownloadUrl, COVERAGE_REQUIRED } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import withQueryResults from './QueryResultsSelector';
import { TAG_SET_CLIFF_ORGS } from '../../../lib/tagUtil';

// const NUM_TO_SHOW = 20;

const localMessages = {
  title: { id: 'explorer.entities.title', defaultMessage: 'Top Organizations' },
  organization: { id: 'explorer.entities.organization', defaultMessage: 'Organization' },
  helpIntro: { id: 'explorer.entities.help.title', defaultMessage: '<p>Looking at which organizations and companies are being talked about can give you a sense of how the media is focusing on the issue you are investigating. This is a list of the organizations mentioned most often in a sampling of stories. Click on a name to add it to all your queries. Click the menu on the bottom right to download a CSV of all the organizations mentioned in a sample of stories.</p>' },
  downloadCsv: { id: 'explorer.entities.downloadCsv', defaultMessage: 'Download { name } top organizations CSV' },
};

class QueryTopEntitiesOrgsResultsContainer extends React.Component {
  downloadCsv = (query) => {
    postToDownloadUrl(`/api/explorer/tags/${TAG_SET_CLIFF_ORGS}/top-tags.csv`, query);
  }
  render() {
    const { results, queries, handleEntitySelection, selectedTabIndex, tabSelector } = this.props;
    const { formatNumber } = this.props.intl;
    let content = null;
    if (results) {
      const rawData = results[selectedTabIndex] ? results[selectedTabIndex].results : [];
      const coverageRatio = results[selectedTabIndex] ? results[selectedTabIndex].coverage_percentage : 0;
      if (coverageRatio > COVERAGE_REQUIRED) {
        content = (
          <div>
            {rawData &&
              <EntitiesTable
                className="explorer-entity"
                entityColNameMsg={localMessages.organization}
                entities={rawData}
                onClick={e => handleEntitySelection(e, queries[0].searchId)}
                maxTitleLength={50}
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

QueryTopEntitiesOrgsResultsContainer.propTypes = {
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
  handleEntitySelection: PropTypes.func.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  lastSearchTime: state.explorer.lastSearchTime.time,
  fetchStatus: state.explorer.topEntitiesOrgs.fetchStatus,
  results: state.explorer.topEntitiesOrgs.results,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (queries) => {
    // this should trigger when the user clicks the Search button or changes the URL
    // for n queries, run the dispatch with each parsed query
    dispatch(resetEntitiesOrgs());
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
        return dispatch(fetchTopEntitiesOrgs(infoToQuery));
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
        return dispatch(fetchDemoTopEntitiesOrgs(demoInfo)); // id
      });
    }
  },
  handleEntitySelection: (entity, isCannedSearch) => {
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
      composeSummarizedVisualization(localMessages.title, localMessages.helpIntro, [messages.entityHelpDetails])(
        withAsyncFetch(
          withQueryResults(
            QueryTopEntitiesOrgsResultsContainer
          )
        )
      )
    )
  );
