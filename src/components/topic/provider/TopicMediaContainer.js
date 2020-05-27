import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ActionMenu from '../../common/ActionMenu';
import withCsvDownloadNotifyContainer from '../../common/hocs/CsvDownloadNotifyContainer';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import MediaTableContainer from '../MediaTableContainer';
import messages from '../../../resources/messages';
import { fetchTopicProviderMedia } from '../../../actions/topicActions';
import { DownloadButton } from '../../common/IconButton';
import DataCard from '../../common/DataCard';
import { combineQueryParams, filtersAsUrlParams, formatAsUrlParams } from '../../util/location';
import { HELP_SOURCES_CSV_COLUMNS } from '../../../lib/helpConstants';
import withSorting from '../../common/hocs/Sorted';
import { FETCH_INVALID } from '../../../lib/fetchConstants';

const localMessages = {
  title: { id: 'topic.summary.topMedia.title', defaultMessage: 'Top Media' },
  downloadCSV: { id: 'topic.summary.topMedia.downloadCSV', defaultMessage: 'Download CSV Of All Media' },
};

const NUM_TO_SHOW = 10;

const TopicMediaContainer = (props) => (
  <DataCard className={props.className} border={(props.border === true) || (props.border === undefined)}>
    <MediaTableContainer
      media={props.media}
      onChangeSort={props.onChangeSort}
      sortedBy={props.sort}
      includeMetadata={false}
    />
    <ActionMenu actionTextMsg={messages.downloadOptions}>
      <MenuItem
        className="action-icon-menu-item"
        onClick={() => {
          const { topicInfo, filters, sort, notifyOfCsvDownload } = props;
          const url = `/api/topics/${topicInfo.topics_id}/provider/media.csv?${filtersAsUrlParams(filters)}&${formatAsUrlParams({ sort })}`;
          window.location = url;
          notifyOfCsvDownload(HELP_SOURCES_CSV_COLUMNS);
        }}
      >
        <ListItemText><FormattedMessage {...localMessages.downloadCSV} /></ListItemText>
        <ListItemIcon><DownloadButton /></ListItemIcon>
      </MenuItem>
    </ActionMenu>
  </DataCard>
);

TopicMediaContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  notifyOfCsvDownload: PropTypes.func.isRequired,
  sort: PropTypes.string,
  onChangeSort: PropTypes.func.isRequired,
  // from parent
  className: PropTypes.string,
  linkId: PropTypes.string,
  border: PropTypes.bool,
  extraArgs: PropTypes.object, // any extra properties you can relayed to the server in the call for listing stories
  extraQueryClause: PropTypes.string,
  // from state
  topicInfo: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  media: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => ({
  fetchStatus: state.topics.selected.provider.media.fetchStatuses[ownProps.uid] || FETCH_INVALID,
  media: state.topics.selected.provider.media.results[ownProps.uid] ? state.topics.selected.provider.media.results[ownProps.uid].media : [],
  topicInfo: state.topics.selected.info,
  filters: state.topics.selected.filters,
});

const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicProviderMedia(props.topicInfo.topics_id, {
  ...props.filters,
  q: combineQueryParams(props.filters.q, props.extraQueryClause),
  ...props.extraArgs,
  uid: props.uid,
  sort: props.sort,
  linkId: props.linkId,
  limit: NUM_TO_SHOW,
}));

export default
injectIntl(
  connect(mapStateToProps)(
    withCsvDownloadNotifyContainer(
      withSorting(
        withFilteredAsyncData(fetchAsyncData, ['sort', 'linkId'])( // refetch data if sort property has changed
          TopicMediaContainer
        )
      )
    )
  )
);
