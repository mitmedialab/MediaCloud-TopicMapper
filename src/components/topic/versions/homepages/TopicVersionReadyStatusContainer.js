import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import TopicFilterBar from '../../controlbar/TopicFilterBar';
import withAsyncData from '../../../common/hocs/AsyncDataContainer';
import { ExploreButton } from '../../../common/IconButton';
import { urlToExplorerQuery } from '../../../../lib/urlUtil';
import NotUsingLatestWarning from '../NotUsingLatestWarning';

const localMessages = {
  topicRunning: { id: 'topic.topicRunning', defaultMessage: 'We are scraping the web for all the stories in include in your topic.' },
  filterTopic: { id: 'topic.filter', defaultMessage: 'Filter this Topic' },
};

class TopicVersionReadyStatusContainer extends React.Component {
  setupJumpToExplorer() {
    const { selectedTimespan, topicInfo, filters } = this.props;
    // set up links to jump to other tools
    if (selectedTimespan) {
      const queryName = `${topicInfo.name}`;
      let queryKeywords = `timespans_id:${filters.timespanId} `;
      if (filters.q && filters.q.length > 0) {
        queryKeywords += ` AND ${filters.q}`;
      }
      const args = [
        queryName,
        queryKeywords,
        [],
        [],
        selectedTimespan.start_date.substr(0, 10),
        selectedTimespan.end_date.substr(0, 10),
      ];
      const explorerUrl = urlToExplorerQuery(...args);
      // const explorerUrl = urlToExplorerQuery(...args);
      return (
        <span className="jumps">
          <a target="top" href={explorerUrl}>
            <ExploreButton />
            <FormattedMessage {...localMessages.jumpToExplorer} />
          </a>
        </span>
      );
    }
    return null;
  }

  render() {
    const { children, topicId, setSideBarContent, location } = this.props;
    return (
      <div>
        <div className="sub">
          <TopicFilterBar topicId={topicId} setSideBarContent={setSideBarContent} location={location} />
          <NotUsingLatestWarning />
          {children}
        </div>
      </div>
    );
  }
}

TopicVersionReadyStatusContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  children: PropTypes.node,
  location: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  fetchStatus: PropTypes.string.isRequired,
  fetchStatusInfo: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  // from state
  filters: PropTypes.object.isRequired,
  topicId: PropTypes.number.isRequired,
  topicInfo: PropTypes.object.isRequired,
  snapshots: PropTypes.array.isRequired,
  snapshotId: PropTypes.number,
  // from state
  needsNewSnapshot: PropTypes.bool,
  selectedTimespan: PropTypes.object,
  // from dispatch
  onFetchAyncData: PropTypes.func.isRequired,
  // from merge
  setSideBarContent: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => ({
  filters: state.topics.selected.filters,
  topicId: state.topics.selected.id,
  fetchStatus: state.topics.selected.info.fetchStatus,
  fetchStatusInfo: state.topics.selected.info.fetchStatus,
  topicInfo: state.topics.selected.info,
  params: ownProps.params,
  snapshotId: state.topics.selected.filters.snapshotId,
  snapshots: state.topics.selected.snapshots.list,
  selectedTimespan: state.topics.selected.timespans.selected,
  focalSets: state.topics.selected.focalSets.all.list,
});

const fetchAsyncData = () => false;

export default
injectIntl(
  connect(mapStateToProps)(
    withAsyncData(fetchAsyncData, ['snapshotId', 'timespanId'])(
      TopicVersionReadyStatusContainer
    )
  )
);
