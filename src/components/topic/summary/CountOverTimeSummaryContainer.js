import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib';
import { SummarizedVizualization } from '../../common/hocs/SummarizedVizualization';
import TopicCountOverTimeContainer from '../provider/TopicCountOverTimeContainer';
import TopicAttentionDrillDownContainer from './drilldowns/TopicAttentionDrillDownContainer';
import { resetTopicTopStoriesDrillDown, setTopicTopStoriesDrillDown } from '../../../actions/topicActions';
import messages from '../../../resources/messages';
import { filteredLinkTo, urlWithFilters } from '../../util/location';
import { timespanForDate } from '../../util/topicUtil';
import TopicPropTypes from '../TopicPropTypes';
import { trimToMaxLength } from '../../../lib/stringUtil';

const localMessages = {
  title: { id: 'topic.summary.splitStoryCount.title', defaultMessage: 'Attention Over Time' },
  descriptionIntro: { id: 'topic.summary.splitStoryCount.help.title', defaultMessage: '<p>Analyze attention to this topic over time to understand how it is covered. This chart shows the total number of stories that matched your topic query. Spikes in attention can reveal key events.  Plateaus can reveal stable, "normal", attention levels. <b>Click a point to label it with the top inlinked story in that week.</b></p>' },
  downloadCsv: { id: 'topic.summary.splitStoryCount.download', defaultMessage: 'Download daily story count CSV' },
};

const CountOverTimeSummaryContainer = (props) => {
  const { topic, filters, handleDataPointClick, topStory, selectedStartTimestamp, selectedStoryCount, handleTimePeriodChange } = props;
  let annotations = [];
  // turn the stories fetched into HighCharts "annotations" for display
  if (topStory) {
    annotations = [{
      labelOptions: {
        shape: 'connector',
        align: 'right',
        justify: false,
        style: {
          fontSize: '1em',
          textOutline: '1px white',
        },
      },
      labels: [{
        point: {
          xAxis: 0,
          yAxis: 0,
          x: selectedStartTimestamp,
          y: selectedStoryCount,
        },
        text: trimToMaxLength(topStory.title, 60),
      }],
    }];
  }
  return (
    <>
      <Row>
        <Col lg={12}>
          <SummarizedVizualization
            titleMessage={messages.attention}
            introMessage={localMessages.descriptionIntro}
            handleExplore={urlWithFilters(`/topics/${topic.topics_id}/attention`, filters)}
            wide
          >
            <TopicCountOverTimeContainer
              uid="topic"
              border={false}
              backgroundColor="#f5f5f5"
              onDataPointClick={handleDataPointClick}
              annotations={annotations}
              onTimePeriodChange={handleTimePeriodChange}
            />
          </SummarizedVizualization>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <TopicAttentionDrillDownContainer topicId={topic.topics_id} filters={filters} />
        </Col>
      </Row>
    </>
  );
};

CountOverTimeSummaryContainer.propTypes = {
  // from composition chain
  intl: PropTypes.object.isRequired,
  // from parent
  topic: PropTypes.object.isRequired,
  filters: TopicPropTypes.filters.isRequired,
  timespans: PropTypes.array.isRequired,
  // from state
  topStory: PropTypes.object,
  selectedStartTimestamp: PropTypes.number,
  selectedStoryCount: PropTypes.number,
  // from dispath
  handleExplore: PropTypes.func.isRequired,
  handleDataPointClick: PropTypes.func.isRequired,
  handleTimePeriodChange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  selectedStartTimestamp: state.topics.selected.summary.attentionDrillDownStories.selectedStartTimestamp,
  selectedStoryCount: state.topics.selected.summary.attentionDrillDownStories.selectedStoryCount,
  topStory: state.topics.selected.provider.stories.results.summaryDrillDown ? state.topics.selected.provider.stories.results.summaryDrillDown.stories[0] : null,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleExplore: () => {
    const exploreUrl = filteredLinkTo(`/topics/${ownProps.topicId}/attention`, ownProps.filters);
    dispatch(push(exploreUrl));
  },
  handleDataPointClick: (startDate, endDate, evt, chartObj, point0x, point1x, pointValue) => {
    const selectedTimespan = timespanForDate(startDate, ownProps.timespans, 'weekly');
    dispatch(setTopicTopStoriesDrillDown({ selectedTimespan, point0x, pointValue }));
  },
  // when time period changes we need to clear the peaks we've annotated, because they aren't there anymore
  handleTimePeriodChange: () => dispatch(resetTopicTopStoriesDrillDown()),
});

export default
injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    CountOverTimeSummaryContainer
  )
);
