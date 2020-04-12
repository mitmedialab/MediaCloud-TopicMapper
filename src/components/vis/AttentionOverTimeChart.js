import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import initHighcharts from './initHighcharts';
import { getBrandDarkColor } from '../../styles/colors';
import { getVisDate, PAST_DAY, PAST_WEEK, PAST_MONTH, groupDatesByWeek, groupDatesByMonth } from '../../lib/dateUtil';
import { STACKED_VIEW } from '../../lib/visUtil';
import messages from '../../resources/messages';

initHighcharts();

const SECS_PER_DAY = 1000 * 60 * 60 * 24;

const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

// don't show dots on line if more than this many data points
const SERIES_MARKER_THRESHOLD = 30;

const localMessages = {
  chartTitle: { id: 'chart.storiesOverTime.title', defaultMessage: 'Attention Over Time' },
  tooltipSeriesName: { id: 'chart.storiesOverTime.tooltipSeriesName', defaultMessage: 'Query: {name}' },
  tooltipText: { id: 'chart.storiesOverTime.tooltipText', defaultMessage: '{count} {count, plural, =1 {story} other {stories} }' },
  normalizedTooltipText: { id: 'chart.storiesOverTime.normalizedTooltipText', defaultMessage: '{count}% of stories' },
  storiesPerDay: { id: 'chart.storiesOverTime.seriesTitle.day', defaultMessage: 'stories/day' },
  storiesPerWeek: { id: 'chart.storiesOverTime.seriesTitle.week', defaultMessage: 'stories/week' },
  storiesPerMonth: { id: 'chart.storiesOverTime.seriesTitle.month', defaultMessage: 'stories/month' },
  totalCount: { id: 'chart.storiesOverTime.totalCount',
    defaultMessage: 'We have collected {total, plural, =0 {No stories} one {One story} other {{formattedTotal} stories}}.',
  },
  yAxisNormalizedTitle: { id: 'chart.storiesOverTime.series.yaxis', defaultMessage: 'percentage of stories' },
  clickForDetails: { id: 'chart.storiesOverTime.clickForDetails', defaultMessage: 'Click for details' },
};

function yAxisTitleByInterval(interval) {
  if (interval === PAST_MONTH) {
    return localMessages.storiesPerMonth;
  }
  if (interval === PAST_WEEK) {
    return localMessages.storiesPerWeek;
  }
  if (interval === PAST_DAY) {
    return localMessages.storiesPerDay;
  }
  return messages.unknown;
}

function makePercentage(value) { return value * 100; }

export function dataAsSeries(data, fieldName = 'count') {
  // clean up the data
  const dates = data.map(d => d.date);
  // turning variable time unit into days
  const intervalMs = (dates[1] - dates[0]);
  const intervalDays = intervalMs / SECS_PER_DAY;
  const values = data.map(d => d[fieldName] / intervalDays);
  return { data: values, pointInterval: intervalMs, pointStart: dates[0] };
}

/**
 * Pass in "data" if you are using one series, otherwise configure them yourself and pass in "series".
 */
class AttentionOverTimeChart extends React.Component {
  getConfig() {
    const { backgroundColor, normalizeYAxis, interval, onDataPointClick } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;

    const config = {
      title: formatMessage(localMessages.chartTitle),
      lineColor: getBrandDarkColor(),
      interval: PAST_DAY, // defaulting to by day
      chart: {
        type: 'spline',
        zoomType: 'x',
        backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR,
      },
      plotOptions: {
        series: {
          connectNulls: false,
          marker: {
            enabled: true,
          },
        },
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          millisecond: '%m/%e/%y',
          second: '%m/%e/%y',
          minute: '%m/%e/%y',
          hour: '%m/%e/%y',
          day: '%m/%e/%y',
          week: '%m/%e/%y',
          month: '%m/%y',
          year: '%Y',
        },
      },
      tooltip: {
        pointFormatter: function afmtxn() {
          // important to name this, rather than use arrow function, so `this` is preserved to be what highcharts gives us
          const rounded = formatNumber(this.y, { style: 'decimal', maximumFractionDigits: 2 });
          const pct = formatNumber(this.y * 100, { style: 'decimal', maximumFractionDigits: 2 });
          const seriesName = this.series.name ? formatMessage(localMessages.tooltipSeriesName, { name: this.series.name }) : '';
          const val = normalizeYAxis === true ? formatMessage(localMessages.normalizedTooltipText, { count: pct }) : formatMessage(localMessages.tooltipText, { count: rounded });
          const clickInvitation = (onDataPointClick) ? `<br />${formatMessage(localMessages.clickForDetails)}` : '';
          const thisDate = getVisDate(new Date(this.category));
          const nextDate = getVisDate(new Date(this.category + this.series.pointInterval));
          const intervalDays = this.series.pointInterval / SECS_PER_DAY;
          if (intervalDays > 1) {
            this.series.tooltipOptions.xDateFormat = `Date Range: ${thisDate} to ${nextDate}`;
          }
          return (`${seriesName}<br/>${val}${clickInvitation}`);
        },
      },
      yAxis: {
        labels: { formatter: function afxn() { return normalizeYAxis === true ? `${makePercentage(this.value)}%` : this.value; } },
        min: 0,
        title: { text: normalizeYAxis === true ? formatMessage(localMessages.yAxisNormalizedTitle) : formatMessage(yAxisTitleByInterval(interval)) },
      },
      exporting: {
      },
    };
    return config;
  }

  render() {
    const { total, data, annotations, series, height, interval, display, onDataPointClick, lineColor,
      health, filename, showLegend, introText, normalizeYAxis } = this.props;
    const { formatMessage } = this.props.intl;
    // setup up custom chart configuration
    const config = this.getConfig();
    config.chart.height = height;
    let classNameForPath = 'stories-over-time-chart';
    if (filename !== undefined) {
      config.exporting.filename = filename;
    } else {
      config.exporting.filename = formatMessage(yAxisTitleByInterval(interval));
    }
    if ((health !== null) && (health !== undefined)) {
      config.xAxis.plotLines = health.map(h => ({ className: 'health-plot-line', ...h }));
    }
    if ((lineColor !== null) && (lineColor !== undefined)) {
      config.lineColor = lineColor;
    }
    if ((display !== null) && (display !== undefined) && (display === STACKED_VIEW)) {
      config.chart = {
        type: 'areaspline',
      };
      config.plotOptions.areaspline = {
        stacking: 'normal',
        lineWidth: 0,
      };
      config.tooltip.split = true;
    }
    if ((interval !== null) && (interval !== undefined)) {
      config.interval = interval;
      switch (interval) {
        case PAST_DAY:
          config.intervalVal = 1;
          break;
        case PAST_WEEK:
          config.intervalVal = 7;
          break;
        case PAST_MONTH:
          config.intervalVal = 30;
          break;
        default:
          config.intervalVal = 1;
          break;
      }
    }
    if (onDataPointClick) {
      config.plotOptions.series.allowPointSelect = true;
      config.plotOptions.series.point = {
        events: {
          click: function handleDataPointClick(evt) {
            const point0 = evt.point;
            const value = evt.point.y;
            const date0 = new Date(point0.x);
            // handle clicking on last point
            const point1 = (point0.index < (point0.series.data.length - 1)) ? point0.series.data[evt.point.index + 1] : point0;
            const date1 = new Date(point1.x);
            onDataPointClick(date0, date1, evt, this, point0.x, point1.x, value); // preserve the highcharts "this", which is the chart
          },
        },
      };
      classNameForPath = 'sentences-over-time-chart-with-node-info';
    }
    config.annotations = annotations;
    let allSeries = null;
    if (data !== undefined) {
      config.plotOptions.series.marker.enabled = (data.length < SERIES_MARKER_THRESHOLD);
      // clean up the data
      allSeries = [{
        id: 0,
        name: filename,
        color: config.lineColor,
        data: data.map(d => d.count),
        pointStart: data[0].date,
        pointInterval: data[1].date - data[0].date,
        showInLegend: showLegend !== false,
      }];
    } else if (series !== undefined && series.length > 0) {
      allSeries = series;
      config.plotOptions.series.marker.enabled = series[0].data ? (series[0].data.length < SERIES_MARKER_THRESHOLD) : false;
    }
    // now aggregate the dates as specified
    if (allSeries) { // being careful about situations in between renders
      config.series = allSeries.map((thisSeries) => {
        const dataAsList = thisSeries.data.map((d, idx) => ({
          count: d,
          date: thisSeries.pointStart + (idx * thisSeries.pointInterval),
        }));
        let groupedData = dataAsList;
        if (config.interval === PAST_WEEK) {
          groupedData = groupDatesByWeek(groupedData);
        } else if (config.interval === PAST_MONTH) {
          groupedData = groupDatesByMonth(groupedData);
        }
        const dates = Object.values(groupedData).map(d => d.date);
        const intervalMs = SECS_PER_DAY * config.intervalVal;
        // grab the grouped sum if showing counts, or avg if doing ratios (not ideal, but easier to implement)
        let values;
        if (normalizeYAxis) {
          values = Object.values(groupedData).map(d => (d.avg !== undefined ? d.avg : d.count));
        } else {
          values = Object.values(groupedData).map(d => (d.sum !== undefined ? d.sum : d.count));
        }
        return {
          ...thisSeries,
          data: values,
          pointStart: dates[0],
          pointInterval: intervalMs,
        };
      });
    }
    // show total if it is included
    let totalInfo = null;
    if (introText) {
      totalInfo = (<p>{introText}</p>);
    } else if ((total !== null) && (total !== undefined)) {
      totalInfo = (
        <p>
          <FormattedMessage
            {...localMessages.totalCount}
            values={{ total, formattedTotal: (<FormattedNumber value={total} />) }}
          />
        </p>
      );
    }
    // render out the chart
    return (
      <div className={classNameForPath}>
        {totalInfo}
        <HighchartsReact highcharts={Highcharts} options={config} />
      </div>
    );
  }
}

AttentionOverTimeChart.propTypes = {
  // from parent
  data: PropTypes.array,
  annotations: PropTypes.array,
  series: PropTypes.array,
  height: PropTypes.number.isRequired,
  lineColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  health: PropTypes.array,
  interval: PropTypes.oneOf([PAST_DAY, PAST_WEEK, PAST_MONTH]),
  display: PropTypes.string,
  onDataPointClick: PropTypes.func, // (date0, date1, evt, chartObj)
  total: PropTypes.number,
  introText: PropTypes.string, // overrides automatic total string generation
  filename: PropTypes.string,
  showLegend: PropTypes.bool,
  normalizeYAxis: PropTypes.bool,
  // from composition chain
  intl: PropTypes.object.isRequired,
};

// Specifies the default values for props:
AttentionOverTimeChart.defaultProps = {
  interval: PAST_DAY,
};

export default injectIntl(AttentionOverTimeChart);
