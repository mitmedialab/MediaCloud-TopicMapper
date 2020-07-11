import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import withSummary from '../../common/hocs/SummarizedVizualization';
import { DownloadButton } from '../../common/IconButton';
import ActionMenu from '../../common/ActionMenu';
import EntitiesTable from '../../common/EntitiesTable';
import { fetchTopEntitiesPeople } from '../../../actions/explorerActions';
import { postToDownloadUrl, COVERAGE_REQUIRED, ENTITY_DISPLAY_TOP_TEN } from '../../../lib/explorerUtil';
import messages from '../../../resources/messages';
import withQueryResults from './QueryResultsSelector';
import { TAG_SET_CLIFF_PEOPLE } from '../../../lib/tagUtil';

const localMessages = {
  title: { id: 'explorer.entities.title', defaultMessage: 'Top People' },
  person: { id: 'explorer.entities.person', defaultMessage: 'Person' },
  helpIntro: { id: 'explorer.entities.help.title', defaultMessage: '<p>Looking at <i>who</i> is being talked about can give you a sense of how the media is focusing on the issue you are investigating. This is a list of the people mentioned most often in a sampling of stories. Click on a name to add it to all your queries. Click the menu on the bottom right to download a CSV of the people mentioned in all the stories matching your query.</p>' },
  downloadCsv: { id: 'explorer.entities.downloadCsv', defaultMessage: 'Download { name } all people CSV' },
};

class QueryTopEntitiesPeopleResultsContainer extends React.Component {
  downloadCsv = (query) => {
    postToDownloadUrl(`/api/explorer/tags/${TAG_SET_CLIFF_PEOPLE}/top-tags.csv`, query);
  }

  render() {
    const { results, queries, selectedQuery, handleEntitySelection, tabSelector, selectedTabIndex } = this.props;
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
                entityColNameMsg={localMessages.person}
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

QueryTopEntitiesPeopleResultsContainer.propTypes = {
  // from parent
  lastSearchTime: PropTypes.number.isRequired,
  queries: PropTypes.array.isRequired,
  selectedQuery: PropTypes.object.isRequired,
  // from composition
  intl: PropTypes.object.isRequired,
  selectedTabIndex: PropTypes.number.isRequired,
  tabSelector: PropTypes.object.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  results: PropTypes.object.isRequired,
  // from dispatch
  handleEntitySelection: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.explorer.topEntitiesPeople.fetchStatus,
  results: state.explorer.topEntitiesPeople.results,
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
      withQueryResults(fetchTopEntitiesPeople)(
        QueryTopEntitiesPeopleResultsContainer
      )
    )
  )
);
