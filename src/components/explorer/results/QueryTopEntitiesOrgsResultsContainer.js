import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import EntitiesTable from '../../common/EntitiesTable';
import { fetchTopEntitiesOrgs } from '../../../actions/explorerActions';
import { postToDownloadUrl, COVERAGE_REQUIRED, ENTITY_DISPLAY_TOP_TEN } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import withQueryResults from './QueryResultsSelector';

// const NUM_TO_SHOW = 20;

const localMessages = {
  title: { id: 'explorer.entities.title', defaultMessage: 'Top Organizations' },
  organization: { id: 'explorer.entities.organization', defaultMessage: 'Organization' },
  helpIntro: { id: 'explorer.entities.help.title', defaultMessage: '<p>Looking at which organizations and companies are being talked about can give you a sense of how the media is focusing on the issue you are investigating. This is a list of the organizations mentioned most often in a sampling of stories. Click on a name to add it to all your queries. Click the menu on the bottom right to download a CSV of the organizations mentioned in all the stories matching your query.</p>' },
  downloadCsv: { id: 'explorer.entities.downloadCsv', defaultMessage: 'Download { name } all organizations CSV' },
};

class QueryTopEntitiesOrgsResultsContainer extends React.Component {
  downloadCsv = (query) => {
    const { cliffOrgsSet } = this.props;
    postToDownloadUrl(`/api/explorer/tags/${cliffOrgsSet}/top-tags.csv`, query);
  }

  render() {
    const { results, queries, selectedQuery, handleEntitySelection, selectedTabIndex, tabSelector } = this.props;
    const { formatNumber } = this.props.intl;
    let content = null;
    const selectedResults = results[selectedQuery.uid];
    if (selectedResults) {
      const rawData = selectedResults.results.slice(0, ENTITY_DISPLAY_TOP_TEN);
      const coverageRatio = selectedResults.coverage_percentage;
      if (coverageRatio > COVERAGE_REQUIRED) {
        content = (
          <div>
            {rawData && (
              <EntitiesTable
                className="explorer-entity"
                entityColNameMsg={localMessages.organization}
                entities={rawData}
                onClick={e => handleEntitySelection(e, queries[0].searchId)}
                maxTitleLength={50}
              />
            )}
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
  // from parent
  queries: PropTypes.array.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  selectedQuery: PropTypes.object.isRequired,
  lastSearchTime: PropTypes.number.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  handleEntitySelection: PropTypes.func.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
  // from state
  results: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  cliffOrgsSet: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topEntitiesOrgs.fetchStatus,
  results: state.explorer.topEntitiesOrgs.results,
  cliffOrgsSet: state.system.staticTags.tagSets.cliffOrgsSet,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleEntitySelection: (entity, isCannedSearch) => {
    const queryClauseToAdd = ` tags_id_stories:${entity}`;
    if (isCannedSearch === undefined) {
      ownProps.onQueryModificationRequested(queryClauseToAdd);
    }
  },
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withSummary(localMessages.title, localMessages.helpIntro, [messages.entityHelpDetails])(
      withQueryResults(fetchTopEntitiesOrgs)(
        QueryTopEntitiesOrgsResultsContainer
      )
    )
  )
);
