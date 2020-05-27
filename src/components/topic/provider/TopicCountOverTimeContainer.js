import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { DownloadButton } from '../../common/IconButton';
import withAttentionAggregation from '../../common/hocs/AttentionAggregation';
import { filtersAsUrlParams, combineQueryParams } from '../../util/location';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import AttentionOverTimeChart from '../../vis/AttentionOverTimeChart';
import { fetchTopicProviderCountOverTime } from '../../../actions/topicActions';
import DataCard from '../../common/DataCard';
import ActionMenu from '../../common/ActionMenu';
import messages from '../../../resources/messages';
import { FETCH_INVALID } from '../../../lib/fetchConstants';
import { getBrandDarkColor } from '../../../styles/colors';

class TopicCountOverTimeContainer extends React.Component {
  componentDidUpdate(prevProps) {
    const { selectedTimePeriod, onTimePeriodChange } = this.props;
    if (onTimePeriodChange && (prevProps.selectedTimePeriod !== selectedTimePeriod)) {
      onTimePeriodChange(selectedTimePeriod);
    }
  }

  render() {
    const { border, className, titleMsg, total, counts, selectedTimePeriod, attentionAggregationMenuItems,
      topicInfo, filters, extraQueryClause } = this.props;
    return (
      <DataCard className={className} border={(border === true) || (border === undefined)}>
        {titleMsg && <h2><FormattedHTMLMessage {...titleMsg} /></h2>}
        <AttentionOverTimeChart
          total={total}
          data={counts}
          height={200}
          lineColor={getBrandDarkColor()}
          interval={selectedTimePeriod}
          {...this.props}
        />
        <div className="action-menu-set">
          <ActionMenu actionTextMsg={messages.viewOptions}>
            {attentionAggregationMenuItems}
          </ActionMenu>
          <ActionMenu actionTextMsg={messages.downloadOptions}>
            <MenuItem
              className="action-icon-menu-item"
              id="topic-summary-top-stories-download-dialog"
              onClick={() => {
                const url = `/api/topics/${topicInfo.topics_id}/provider/count-over-time.csv?${filtersAsUrlParams({
                  ...filters, q: combineQueryParams(filters.q, extraQueryClause) })}`;
                window.location = url;
              }}
            >
              <ListItemText><FormattedMessage {...messages.download} /></ListItemText>
              <ListItemIcon>
                <DownloadButton />
              </ListItemIcon>
            </MenuItem>
          </ActionMenu>
        </div>
      </DataCard>
    );
  }
}

TopicCountOverTimeContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  attentionAggregationMenuItems: PropTypes.array.isRequired,
  selectedTimePeriod: PropTypes.string.isRequired,
  // from parent
  className: PropTypes.string,
  linkId: PropTypes.string,
  border: PropTypes.bool,
  titleMsg: PropTypes.object,
  uid: PropTypes.string.isRequired, // too support mulitple on one page
  extraQueryClause: PropTypes.string,
  onTimePeriodChange: PropTypes.func,
  // from state
  topicInfo: PropTypes.object.isRequired,
  filters: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  total: PropTypes.number,
  counts: PropTypes.array,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: state.topics.selected.info.topics_id, // redundant, but required by withTopicStoryDownload
  topicInfo: state.topics.selected.info,
  filters: state.topics.selected.filters,
  fetchStatus: state.topics.selected.provider.countOverTime.fetchStatuses[ownProps.uid] || FETCH_INVALID,
  total: state.topics.selected.provider.countOverTime.results[ownProps.uid] ? state.topics.selected.provider.countOverTime.results[ownProps.uid].total : 0,
  counts: state.topics.selected.provider.countOverTime.results[ownProps.uid] ? state.topics.selected.provider.countOverTime.results[ownProps.uid].counts : [],
});

const fetchAsyncData = (dispatch, props) => dispatch(fetchTopicProviderCountOverTime(props.topicInfo.topics_id, {
  ...props.filters,
  q: combineQueryParams(props.filters.q, props.extraQueryClause),
  uid: props.uid,
}));

export default
injectIntl(
  connect(mapStateToProps)(
    withAttentionAggregation(
      withFilteredAsyncData(fetchAsyncData, ['sort', 'linkId'])(
        TopicCountOverTimeContainer
      )
    )
  )
);
