import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import initHighcharts from './initHighcharts';

const DEFAULT_HEIGHT = 320;

initHighcharts();
/**
 * Pass in data - an array of `name`/`value` objects
 */
const PieChart = (props) => {
  const { title, data, tooltipText, height, showDataLabels } = props;
  const colors = data.map(d => d.color);
  const config = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie',
      height: height || DEFAULT_HEIGHT,
    },
    title: {
      text: title,
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>',
    },
    colors,
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: showDataLabels,
          format: '<b>{point.name}</b>: {point.y}',
        },
      },
    },
    series: [{
      colorByPoint: true,
      name: tooltipText,
      data,
    }],
  };
  return (
    <div className="pie-chart">
      <HighchartsReact highcharts={Highcharts} options={config} />
    </div>
  );
};

PieChart.propTypes = {
  // from parent
  title: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  onPieSliceClick: PropTypes.func,
  tooltipText: PropTypes.string,
  showDataLabels: PropTypes.bool.isRequired,
  height: PropTypes.number,
  // from composition chain
  intl: PropTypes.object.isRequired,
};

export default injectIntl(PieChart);
