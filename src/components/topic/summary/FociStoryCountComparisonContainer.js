import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import DataCard from '../../common/DataCard';
import withFilteredAsyncData from '../FilteredAsyncDataContainer';
import initHighcharts from '../../vis/initHighcharts';
import { fetchTopicFocalSetsList } from '../../../actions/topicActions';

const localMessages = {
  title: { id: 'topic.summary.fociStoryCounts.title', defaultMessage: 'Subtopic Story Counts (filtered)' },
  chartTitle: { id: 'topic.summary.fociStoryCounts.chartTitle', defaultMessage: 'Subtopic Story Count' },
  chartYAxisLabel: { id: 'topic.summary.fociStoryCounts.chartYAxisLabel', defaultMessage: 'filtered story count' },
};

const DEFAULT_HEIGHT = 400;

const buildFociComparisonChart = (focalSets, maxStories, height = undefined) => {
  const colorFactory = idx => d3.schemeCategory10[idx % 10];
  // make a list of foci, colored by focal set they are part of
  const data = [];
  focalSets.forEach((fs, idx) => {
    const fsColor = colorFactory(idx);
    fs.foci.forEach((f) => {
      data.push({
        y: f.story_count,
        color: fsColor,
        name: f.name,
        setName: fs.name,
      });
    });
  });
  const config = {
    chart: {
      backgroundColor: '#f5f5f5',
      type: 'column',
      height: height || DEFAULT_HEIGHT,
      legend: {
        enabled: false,
      },
    },
    plotOptions: {
      column: {
        pointWidth: 14,
      },
    },
    tooltip: {
      formatter: function toolTipFormatter() {
        return `<b>${this.point.name}</b><br />Set: ${this.point.setName}</b><br />Stories: ${this.y}`;
      },
    },
    title: {},
    xAxis: {
      type: 'category',
      labels: {
        rotation: -45,
        style: {
          fontSize: '13px',
          fontFamily: 'Lato, Helvetica, sans',
        },
      },
    },
    yAxis: {
      min: 0,
      max: maxStories,
      title: {},
    },
    series: [{
      name: 'stories',
      data,
    }],
    legend: {
      enabled: false,
    },
  };
  return config;
};

initHighcharts();

const FociStoryCountComparisonContainer = (props) => {
  const { focalSets, timespanStoryCount } = props;
  const { formatMessage } = props.intl;
  const config = buildFociComparisonChart(focalSets, timespanStoryCount);
  config.title.text = formatMessage(localMessages.chartTitle);
  config.yAxis.title.text = formatMessage(localMessages.chartYAxisLabel);
  return (
    <DataCard>
      <h2><FormattedMessage {...localMessages.title} /></h2>
      <HighchartsReact highcharts={Highcharts} options={config} />
    </DataCard>
  );
};

FociStoryCountComparisonContainer.propTypes = {
  // from compositional chain
  intl: PropTypes.object.isRequired,
  // from parent
  topicId: PropTypes.number.isRequired,
  filters: PropTypes.object.isRequired,
  // from store
  fetchStatus: PropTypes.string.isRequired,
  focalSets: PropTypes.array,
  timespanStoryCount: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.topics.selected.focalSets.all.fetchStatus,
  focalSets: state.topics.selected.focalSets.all.list,
  timespanStoryCount: state.topics.selected.timespans.selected.story_count,
});

const fetchAsyncData = (dispatch, { topicId, filters }) => {
  dispatch(fetchTopicFocalSetsList(topicId, { ...filters, includeStoryCounts: 1 }));
};

export default
injectIntl(
  connect(mapStateToProps)(
    withFilteredAsyncData(fetchAsyncData)(
      FociStoryCountComparisonContainer
    )
  )
);
