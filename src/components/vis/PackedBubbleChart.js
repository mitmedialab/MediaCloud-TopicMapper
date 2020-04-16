import PropTypes from 'prop-types';
import React from 'react';
import * as d3 from 'd3';
import { FormattedMessage, injectIntl } from 'react-intl';

const DEFAULT_WIDTH = 530;
const DEFAULT_MIN_BUBBLE_RADIUS = 5;
const DEFAULT_MAX_BUBBLE_RADIUS = 70;
const DEFAULT_HEIGHT = 200;

const localMessages = {
  noData: { id: 'chart.bubble.noData', defaultMessage: 'Sorry, but we don\'t have any data to draw this chart.' },
};

function drawViz(wrapperElement, {
  data, width, height, maxBubbleRadius, minBubbleRadius, domId, onClick,
}) {
  // const { formatNumber } = this.props.intl;
  const options = {
    width,
    height,
    maxBubbleRadius,
    minBubbleRadius,
  };
  if ((width === null) || (width === undefined)) {
    options.width = DEFAULT_WIDTH;
  }
  if ((height === null) || (height === undefined)) {
    options.height = DEFAULT_HEIGHT;
  }
  if ((minBubbleRadius === null) || (minBubbleRadius === undefined)) {
    options.minBubbleRadius = DEFAULT_MIN_BUBBLE_RADIUS;
  }
  if ((maxBubbleRadius === null) || (maxBubbleRadius === undefined)) {
    options.maxBubbleRadius = DEFAULT_MAX_BUBBLE_RADIUS;
  }

  let circles = null;
  let hierarchialData = null;
  let pack = null;

  // put data in thin hierarchial order so d3 can pack it and size it for us
  hierarchialData = [].concat(data).concat([{ name: 'top', id: 'top', value: 0, x: 0, y: 0 }]);
  hierarchialData = d3.stratify()
    .id((d, idx) => ((d.centerText ? d.centerText : d.name) ? d.name : idx))
    .parentId(d => (d.centerText || d.name === undefined ? 'top' : undefined))(hierarchialData)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  pack = d3.pack().size([options.width, options.height]);

  circles = pack(hierarchialData).descendants();

  if (circles && circles.length > 0) {
    // render it all
    const node = d3.select(wrapperElement);
    if (!node.empty()) { // make sure you don't render the chart more than once
      node.html('');
    }
    const div = node.append('div').attr('id', 'bubble-chart-wrapper');
    const svg = div.append('svg:svg');
    svg.attr('id', domId)
      .attr('width', options.width)
      .attr('height', options.height)
      .attr('class', 'bubble-chart');
    // rollover tooltip
    const rollover = d3.select('#bubble-chart-tooltip')
      .style('opacity', 0);

    // only center align if auto layout
    const horizontalTranslaton = options.width / 2;
    const bubbles = svg.append('g')
      .attr('transform', `translate(${horizontalTranslaton},${options.height / 2})`)
      .selectAll('.bubble')
      .data(circles)
      .enter();

    // create the bubbles
    const midW = options.width / 2;
    const midH = options.height / 2;

    bubbles.append('circle')
      .attr('className', 'bubble-chart-wrapper')
      .style('fill', d => (d.data && d.data.fill ? d.data.fill : ''))
      .style('fill-opacity', d => (d.parent !== null ? 1 : 0))
      .style('display', d => (d.parent !== null ? 'inline' : 'none'))
      .attr('transform', d => `translate(${d.x - midW},${d.y - midH})`)
      .attr('r', d => d.r);
    // add tooltip to bubbles
    bubbles.selectAll('circle')
      .on('click', (d) => {
        const { event } = d3;
        if ((onClick !== null) && (onClick !== undefined)) {
          onClick(d, d3.select(event.target));
        }
        return null;
      })
      .on('mouseover', (d) => {
        const pixel = 'px';
        rollover.transition().duration(200).style('opacity', 0.9);
        rollover.html(d.data && d.data.rolloverText ? d.data.rolloverText : '')
          .style('left', d3.event.pageX + pixel)
          .style('top', d3.event.pageY + pixel);
      })
      .on('mouseout', () => {
        rollover.transition().duration(500).style('opacity', 0);
      });

    // add center labels
    bubbles.append('text')
      .attr('x', d => d.x - midW)
      .attr('y', d => (d.y - midH))
      .attr('text-anchor', 'middle')
      .attr('fill', d => (d.centerTextColor ? `${d.centerTextColor} !important` : ''))
      .attr('font-family', 'Lato, Helvetica, sans')
      .attr('font-size', '10px')
      .text(d => (d.data && d.data.centerText ? d.data.centerText : ''));
    // add top labels
    bubbles.append('text')
      .attr('x', d => d.x - midW)
      .attr('y', d => d.y - midH - d.r - 7)
      .attr('text-anchor', 'middle')
      .attr('fill', d => (d.aboveTextColor ? `${d.aboveTextColor} !important` : ''))
      .attr('font-family', 'Lato, Helvetica, sans')
      .attr('font-size', '10px')
      .text(d => (d.data && d.data.aboveText ? d.data.aboveText : ''));

    // add bottom labels
    bubbles.append('text')
      .attr('x', d => d.x - midW)
      .attr('y', d => (d.y - midH) + (d.r + 15))
      .attr('text-anchor', 'middle')
      .attr('fill', d => (d.belowTextColor ? `${d.belowTextColor} !important` : ''))
      .attr('font-family', 'Lato, Helvetica, sans')
      .attr('font-size', '10px')
      .text(d => (d.data && d.data.belowText ? d.data.belowText : ''));
  }
}

/**
 * Draw a bubble chart with labels.  Values are mapped to area, not radius.
 */
class PackedBubbleChart extends React.Component {
  constructor(props) {
    super(props);
    this.chartWrapperRef = React.createRef();
  }

  componentDidMount() {
    drawViz(this.chartWrapperRef.current, this.props);
  }

  componentDidUpdate() {
    drawViz(this.chartWrapperRef.current, this.props);
  }

  render() {
    const { data } = this.props;
    // bail if no data
    if (data.length === 0) {
      return (
        <div>
          <p><FormattedMessage {...localMessages.noData} /></p>
        </div>
      );
    }
    return (<div className="packed-bubble-chart" ref={this.chartWrapperRef} />);
  }
}

PackedBubbleChart.propTypes = {
  intl: PropTypes.object.isRequired,
  /*
  [{
    'value': number,
    'fill': string(optional),
    'centerText': string(optional),
    'centerTextColor': string(optional),
    'aboveText': string(optional),
    'aboveTextColor': string(optional),
    'belowText': string(optional),
    'belowTextColor': string(optional),
    'rolloverText': string(optional),
  }]
  */
  data: PropTypes.array.isRequired,
  domId: PropTypes.string.isRequired, // to make download work
  width: PropTypes.number,
  height: PropTypes.number,
  placement: PropTypes.string,
  maxBubbleRadius: PropTypes.number,
  minBubbleRadius: PropTypes.number,
  onClick: PropTypes.func,
};

export default injectIntl(PackedBubbleChart);
