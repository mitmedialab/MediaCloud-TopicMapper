import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../../common/hocs/AsyncDataContainer';
import CloseableDataCard from '../../../common/CloseableDataCard';
import { resetTopicTopStoriesDrillDown, fetchTopicProviderStories } from '../../../../actions/topicActions';
import TopicPropTypes from '../../TopicPropTypes';
import TopicStoryTableContainer from '../../TopicStoryTableContainer';
import { FETCH_INVALID } from '../../../../lib/fetchConstants';

const localMessages = {
  title: { id: 'topic.attention.drillDown.title', defaultMessage: 'Top Stories by Inlink in Week of {date1} to {date2}' },
};

class TopicAttentionDrillDownContainer extends React.Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { timespan } = this.props;
    const prevTimespan = prevProps.timespan;
    const rootNode = this.rootRef;
    const timespanId = timespan ? timespan.timespans_id : null;
    const prevTimespanId = prevTimespan ? prevTimespan.timespans_id : null;
    // have to treat this node carefully, because it might not be showing
    if (rootNode && rootNode.current && timespan && (timespanId !== prevTimespanId)) {
      rootNode.current.scrollIntoView();
    }
  }

  render() {
    const { handleClose, drillDownStories, timespan } = this.props;
    let content = <span />;
    if (timespan) {
      const title = (
        <h2>
          <FormattedMessage
            {...localMessages.title}
            values={{
              date1: timespan.startDateMoment.format('ll'),
              date2: timespan.endDateMoment.format('ll'),
            }}
          />
        </h2>
      );
      content = (
        <div className="drill-down" ref={this.rootRef}>
          <CloseableDataCard title={title} onClose={handleClose}>
            <TopicStoryTableContainer stories={drillDownStories} sortedBy="inlink" />
          </CloseableDataCard>
        </div>
      );
    }
    return content;
  }
}

TopicAttentionDrillDownContainer.propTypes = {
  // from composition
  intl: PropTypes.object.isRequired,
  // from dispatch
  handleClose: PropTypes.func.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  filters: TopicPropTypes.filters.isRequired,
  // from state
  fetchStatus: PropTypes.string.isRequired,
  timespan: PropTypes.object,
  drillDownStories: PropTypes.array,
  // words: PropTypes.array,
};

const mapStateToProps = state => ({
  timespan: state.topics.selected.summary.attentionDrillDownStories.drillDownTimespan,
  fetchStatus: state.topics.selected.provider.stories.fetchStatuses.summaryDrillDown || FETCH_INVALID,
  drillDownStories: state.topics.selected.provider.stories.results.summaryDrillDown ? state.topics.selected.provider.stories.results.summaryDrillDown.stories : 0,
  // words: state.explorer.topWordsPerDateRange.results,
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => dispatch(resetTopicTopStoriesDrillDown()),
});

const fetchAsyncData = (dispatch, { topicId, timespan, filters }) => {
  if (timespan) {
    dispatch(fetchTopicProviderStories(topicId, {
      ...filters,
      sort: 'inlink',
      limit: 10,
      timespans_id: timespan.timespans_id,
      uid: 'summaryDrillDown',
    }));
    // dispatch(fetchQueryPerDateTopWords({ ...dataPoint }));
  }
};

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withAsyncData(fetchAsyncData, ['timespan'])(
      TopicAttentionDrillDownContainer
    )
  )
);
