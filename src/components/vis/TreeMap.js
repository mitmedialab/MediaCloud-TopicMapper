/* eslint react/no-this-in-sfc: 0 */
import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import initHighcharts from './initHighcharts';
import { getBrandDarkColor, getBrandDarkerColor } from '../../styles/colors';
import { intlIfObject } from '../../lib/stringUtil';

initHighcharts();

/**
 * Pass in data - an array of `name`/`value` objects
 */
const TreeMap = ({ title, data, onLeafClick, intl, domId, tooltipMessage }) => {
  const { formatNumber, formatMessage } = intl;
  const totalCount = data.map(d => d.value).reduce((acc, d) => acc + d, 0);
  const config = {
    colorAxis: {
      minColor: getBrandDarkColor(), // not working
      maxColor: getBrandDarkerColor(),
    },
    title: {
      text: intlIfObject(intl.formatMessage, title),
    },
    series: [{
      layoutAlgorithm: 'squarified',
      color: getBrandDarkColor(),
      type: 'treemap',
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: 'Lato, Helvetica, sans',
          fontSize: '12px',
          fontWeight: 'normal',
          stroke: 'white',
        },
      },
      data,
    }],
    tooltip: {
      pointFormatter: function afmtxn() {
        // important to name this, rather than use arrow function, so `this` is preserved to be what highcharts gives us
        let pct;
        const fraction = this.value / totalCount;
        const rounded = formatNumber(fraction, { style: 'percent', maximumFractionDigits: 2 });
        if (tooltipMessage) {
          pct = formatMessage(tooltipMessage, { count: rounded, name: this.name });
        } else {
          pct = rounded;
        }
        return pct;
      },
    },
    exporting: {
    },
  };
  if (onLeafClick) {
    config.plotOptions = {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: function handleLeafClick(event) {
              onLeafClick(event, this); // preserve the highcharts "this", which is the chart
            },
          },
        },
      },
    };
  }
  return (
    <div className="tree-map" id={domId}>
      <HighchartsReact highcharts={Highcharts} options={config} />
    </div>
  );
};

TreeMap.propTypes = {
  // from parent
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  data: PropTypes.array.isRequired,
  onLeafClick: PropTypes.func,
  color: PropTypes.string,
  domId: PropTypes.string.isRequired, // to make download work
  tooltipMessage: PropTypes.object, // supports count and name variables
  // from composition chain
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TreeMap);
