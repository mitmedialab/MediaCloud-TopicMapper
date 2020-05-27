import PropTypes from 'prop-types';
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FormattedMessage, injectIntl } from 'react-intl';
import initHighcharts from './initHighcharts';
import { getBrandDarkColor } from '../../styles/colors';
import { highchartsRobinsonLowRes } from '../../lib/mapUtil';
import { countryTagsWithAlpha2 } from '../../lib/tagUtil';

initHighcharts();

// const map = require('./world-eckert3-lowres');

const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

const localMessages = {
  title: { id: 'chart.geographyAttention.chart.title', defaultMessage: 'Mentions by Country' },
  seriesName: { id: 'chart.geographyAttention.series.name', defaultMessage: 'Geographic Attention' },
  tooltipTitle: { id: 'chart.geographyAttention.title', defaultMessage: '{count} of stories are about {name}' },
  noData: { id: 'chart.geographyAttention.noData', defaultMessage: 'Sorry, but we don\'t have any geographic attention data to show.' },
};

class GeoChart extends React.Component {
  getConfig() {
    const { data, countryMinColorScale, countryMaxColorScale, hoverColor, hideLegend, backgroundColor } = this.props;
    const { formatMessage, formatNumber } = this.props.intl;
    const options = {
      countryMinColorScale: countryMinColorScale || '#ffffff',
      countryMaxColorScale: countryMaxColorScale || getBrandDarkColor(),
      hoverColor: hoverColor || getBrandDarkColor(),
      hideLegend: hideLegend || false,
    };
    const config = {
      // Initiate the chart
      chart: {
        type: 'map',
        map: highchartsRobinsonLowRes,
        backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR,
      },
      title: {
        text: '',
      },
      mapNavigation: {
        enabled: false,
      },
      exporting: {
        enabled: true,
      },
      navigation: {
        buttonOptions: {
          align: 'right',
        },
      },
      colorAxis: {
        minColor: options.countryMinColorScale,
        maxColor: options.countryMaxColorScale,
        type: 'logarithmic',
      },
      tooltip: {
        pointFormatter: function afmtxn() {
          // important to name this, rather than use arrow function, so `this` is preserved to be what highcharts gives us
          const rounded = formatNumber(this.pct, { style: 'percent', maximumFractionDigits: 2 });
          const pct = formatMessage(localMessages.tooltipTitle, { count: rounded, name: this.name });
          return pct;
        },
      },
      series: [{
        data: countryTagsWithAlpha2(data), // grab just country-level tags, add in alpha2 for highcarts rendering
        joinBy: 'iso-a2',
        name: formatMessage(localMessages.seriesName),
        allowPointSelect: true,
        cursor: 'pointer',
        states: {
          hover: {
            color: options.hoverColor,
          },
          select: {
            color: '#a4edba',
            borderColor: 'black',
            dashStyle: 'shortdot',
          },
        },
        dataLabels: {
          enabled: false,
          format: '{point.name} {point.count} ',
        },
      }],
    };
    if (!options.hideLegend) {
      config.legend = {
        layout: 'vertical',
        valueDecimals: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        itemStyle: {
          fontWeight: 'bold',
          fontStyle: 'italic',
          color: 'gray',
          textDecoration: 'none',
        },
        maxHeight: 150,
        symbolHeight: 70,
        align: 'left',
        verticalAlign: 'bottom',
        floating: true,
      };
    } else {
      config.legend = {
        enabled: false,
      };
    }
    return config;
  }

  render() {
    const { onCountryClick, data } = this.props;
    // if there is no data then show info about our geocoding
    let content = null;
    if (data.length === 0) {
      content = <p><FormattedMessage {...localMessages.noData} /></p>;
    } else {
      const config = this.getConfig();
      config.exporting = true;
      if (onCountryClick) {
        config.plotOptions = {
          series: {
            cursor: 'pointer',
            point: {
              events: {
                click: function handleCountryClick(event) {
                  onCountryClick(event, this); // preserve the highcharts "this", which is the chart
                },
              },
            },
          },
        };
      }
      content = <HighchartsReact options={config} highcharts={Highcharts} constructorType="mapChart" />;
    }
    return content;
  }
}


GeoChart.propTypes = {
  data: PropTypes.array.isRequired,
  backgroundColor: PropTypes.string,
  countryMinColorScale: PropTypes.string,
  countryMaxColorScale: PropTypes.string,
  hoverColor: PropTypes.string,
  onCountryClick: PropTypes.func,
  intl: PropTypes.object.isRequired,
  hideLegend: PropTypes.bool,
};

export default injectIntl(GeoChart);
