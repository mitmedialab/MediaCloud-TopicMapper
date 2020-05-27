import PropTypes from 'prop-types';
import React from 'react';
import { FormattedHTMLMessage, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ActionMenu from '../../common/ActionMenu';
import DataCard from '../../common/DataCard';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import { fetchTopicProviderTagUse, filterByQuery } from '../../../actions/topicActions';
import EntitiesTable from '../../common/EntitiesTable';
import { filtersAsUrlParams, formatAsUrlParams } from '../../util/location';
import { DownloadButton } from '../../common/IconButton';
import messages from '../../../resources/messages';
import { FETCH_INVALID } from '../../../lib/fetchConstants';

const COVERAGE_REQUIRED = 0.7;
const NUMBER_TO_SHOW = 10;

const localMessages = {
  notEnoughData: { id: 'topic.snapshot.topOrgs.notEnoughData',
    defaultMessage: '<i>Sorry, but only {pct} of the stories have been processed to add the organizations they mention.  We can\'t gaurantee the accuracy of partial results, so we don\'t show a table of results here.  If you are really curious, you can download the CSV using the link in the top-right of this box, but don\'t trust those numbers as fully accurate. Email us if you want us to process this topic to add the organizations mentioned.</i>',
  },
  downloadCSV: { id: 'topic.snapshot.topOrgs.downloadCSV', defaultMessage: 'Download CSV' },
};

class TopicTagUseContainer extends React.Component {
  downloadCsv = (evt) => {
    const { topicId, filters, tagSetsId, tagsId } = this.props;
    if (evt.preventDefault) {
      evt.preventDefault();
    }
    const url = `/api/topics/${topicId}/provider/tag-use.csv?${filtersAsUrlParams(filters)}&${formatAsUrlParams({ tagSetsId, tagsId })}`;
    window.location = url;
  }

  handleEntityClick = (tagId) => {
    const { filters, updateQueryFilter } = this.props;
    const queryFragment = `tags_id_stories: ${tagId}`;
    if (filters.q && filters.q.length > 0) {
      updateQueryFilter(`(${filters.q}) AND (${queryFragment})`);
    } else {
      updateQueryFilter(queryFragment);
    }
  }

  render() {
    const { coverage, data, border } = this.props;
    const { formatNumber } = this.props.intl;
    let content = null;
    const coverageRatio = coverage.count / coverage.total;
    if (coverageRatio >= COVERAGE_REQUIRED) {
      content = <EntitiesTable entities={data.slice(0, NUMBER_TO_SHOW)} onClick={(...args) => this.handleEntityClick(args)} />;
    } else {
      content = (
        <p>
          <FormattedHTMLMessage
            {...localMessages.notEnoughData}
            values={{
              pct: formatNumber(coverageRatio, { style: 'percent', maximumFractionDigits: 2 }),
            }}
          />
        </p>
      );
    }
    return (
      <DataCard border={border}>
        {content}
        <div className="actions">
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <MenuItem
              className="action-icon-menu-item"
              onClick={this.downloadCsv}
            >
              <ListItemText><FormattedMessage {...localMessages.downloadCSV} /></ListItemText>
              <ListItemIcon><DownloadButton /></ListItemIcon>
            </MenuItem>
          </ActionMenu>
        </div>
      </DataCard>
    );
  }
}

TopicTagUseContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  uid: PropTypes.string.isRequired,
  tagSetsId: PropTypes.number,
  tagsId: PropTypes.oneOfType([PropTypes.number, PropTypes.array]).isRequired,
  border: PropTypes.bool,
  // from state
  coverage: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  // from dispatch
  updateQueryFilter: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  fetchStatus: state.topics.selected.provider.tagUse.fetchStatuses[ownProps.uid] || FETCH_INVALID,
  data: state.topics.selected.provider.tagUse.results[ownProps.uid] ? state.topics.selected.provider.tagUse.results[ownProps.uid].list : [],
  coverage: state.topics.selected.provider.tagUse.results[ownProps.uid] ? state.topics.selected.provider.tagUse.results[ownProps.uid].coverage : {},
});

const mapDispatchToProps = dispatch => ({
  updateQueryFilter: (newQueryFilter) => dispatch(filterByQuery(newQueryFilter)),
});


const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicProviderTagUse(props.topicId, {
  ...props.filters,
  uid: props.uid,
  tagSetsId: props.tagSetsId,
  tagsId: props.tagsId,
}));

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withFilteredAsyncData(fetchAsyncData)(
      TopicTagUseContainer
    )
  )
);
