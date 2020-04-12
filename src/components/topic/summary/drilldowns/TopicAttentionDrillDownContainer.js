import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import withAsyncData from '../../../common/hocs/AsyncDataContainer';
import CloseableDataCard from '../../../common/CloseableDataCard';
import { resetTopicTopStoriesDrillDown, fetchTopicTopStoriesOnDates } from '../../../../actions/topicActions';
import TopicPropTypes from '../../TopicPropTypes';
import TopicStoryTable from '../../TopicStoryTable';

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
    const { topicId, handleClose, stories, timespan } = this.props;
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
          <CloseableDataCard
            title={title}
            color=""
            // words={words}
            stories={stories}
            onClose={handleClose}
            content={
              <TopicStoryTable stories={stories} topicId={topicId} sortedBy="inlink" />
            }
          />
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
  fetchStatus: PropTypes.array.isRequired,
  timespan: PropTypes.object,
  stories: PropTypes.array,
  // words: PropTypes.array,
};

const mapStateToProps = state => ({
  fetchStatus: [state.topics.selected.summary.attentionDrillDownStories.fetchStatus],
  timespan: state.topics.selected.summary.splitStoryCount.drillDownTimespan,
  stories: state.topics.selected.summary.attentionDrillDownStories.stories,
  // words: state.explorer.topWordsPerDateRange.results,
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => dispatch(resetTopicTopStoriesDrillDown()),
});

const fetchAsyncData = (dispatch, { topicId, timespan, filters }) => {
  if (timespan) {
    dispatch(fetchTopicTopStoriesOnDates(topicId, {
      ...filters,
      sort: 'inlink',
      limit: 10,
      selectedTimespanId: timespan.timespans_id,
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
