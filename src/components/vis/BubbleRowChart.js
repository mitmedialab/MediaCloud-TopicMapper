import PropTypes from 'prop-types';
import React from 'react';
import * as d3 from 'd3';
import { FormattedMessage, injectIntl } from 'react-intl';

const DEFAULT_WIDTH = 530;
const DEFAULT_MIN_BUBBLE_RADIUS = 5;
const DEFAULT_MAX_BUBBLE_RADIUS = 70;
const DEFAULT_HEIGHT = 200;
const PADDING_BETWEEN_BUBBLES = 10;

const localMessages = {
  noData: { id: 'chart.bubble.noData', defaultMessage: 'Sorry, but we don\'t have any data to draw this chart.' },
};

function drawViz(wrapperElement, {
  data, width, height, minCutoffValue, maxBubbleRadius, asPercentage, minBubbleRadius, padding,
  domId, onBubbleClick,
}) {
  // const { formatNumber } = this.props.intl;
  const options = {
    width,
    height,
    maxBubbleRadius,
    minBubbleRadius,
    padding,
    minCutoffValue,
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
  if ((padding === null) || (padding === undefined)) {
    options.padding = 0;
  }

  if (minCutoffValue === null || minCutoffValue === undefined) {
    options.minCutoffValue = 0;
  }

  let circles = null;

  // prep the data and some config (scale by sqrt of value so we map to area, not radius)
  const maxValue = d3.max(data.map(d => d.value));
  let radiusScale;
  // We size bubbles based on area instead of radius
  if (asPercentage) {
    radiusScale = d3.scaleSqrt().domain([0, 1]).range([0, options.maxBubbleRadius]);
  } else {
    radiusScale = d3.scaleSqrt().domain([0, maxValue]).range([0, options.maxBubbleRadius]);
  }

  const trimmedData = data.filter(d => (d.value > options.minCutoffValue ? d : null));

  if (asPercentage) {
    circles = trimmedData.map((d, idx) => {
      let xOffset = 0;
      xOffset = options.maxBubbleRadius + (((options.maxBubbleRadius * 2) + PADDING_BETWEEN_BUBBLES) * idx);
      return {
        ...d,
        scaledRadius: radiusScale(d.value),
        y: 0,
        x: xOffset,
      };
    });
  } else {
    circles = trimmedData.map((d, idx, list) => {
      let xOffset = 0;
      const scaledRadius = radiusScale(d.value);
      if (idx > 0) {
        const preceeding = list.slice(0, idx);
        const diameters = preceeding.map(d2 => (radiusScale(d2.value) * 2) + PADDING_BETWEEN_BUBBLES);
        xOffset = d3.sum(diameters);
      }
      xOffset += scaledRadius;
      return {
        ...d,
        scaledRadius,
        y: 0,
        x: xOffset,
      };
    });
  }

  if (circles && circles.length > 0) {
    // render it all
    const node = d3.select(wrapperElement).html(''); // important to empty this out
    const div = node.append('div').attr('id', 'bubble-chart-wrapper');
    const svg = div.append('svg:svg');
    svg.attr('id', domId)
      .attr('width', options.width)
      .attr('height', options.height)
      .attr('class', 'bubble-chart');
    // rollover tooltip
    const rollover = d3.select('#bubble-chart-tooltip')
      .style('opacity', 0);

    // calculate the diameter of all the circles, subtract that from the width and divide by two
    const paddingAroundAllBubbles = (options.width - ((options.maxBubbleRadius * 2 * circles.length) + (PADDING_BETWEEN_BUBBLES * (circles.length - 1)))) / 2;
    const horizontalTranslaton = paddingAroundAllBubbles;
    // draw background circles
    if (asPercentage) {
      const totalBubbles = svg.append('g')
        .attr('transform', `translate(${horizontalTranslaton},${options.height / 2})`)
        .selectAll('.total-bubble')
        .data(circles)
        .enter();
      totalBubbles.append('circle')
        .attr('class', 'total')
        .attr('r', options.maxBubbleRadius)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    }
    // now add the bubbles on top
    const bubbles = svg.append('g')
      .attr('transform', `translate(${horizontalTranslaton},${options.height / 2})`)
      .selectAll('.bubble')
      .data(circles)
      .enter();
    const cursor = onBubbleClick ? 'pointer' : '';
    bubbles.append('circle')
      .attr('class', 'pct')
      .attr('r', d => d.scaledRadius)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .style('fill', d => d.fill || '')
      .style('cursor', () => cursor);

    // add tooltip to bubbles
    bubbles.selectAll('circle')
      .on('mouseover', (d) => {
        const pixel = 'px';
        rollover.html(d.rolloverText ? d.rolloverText : '')
          .style('left', d3.event.pageX + pixel)
          .style('top', d3.event.pageY + pixel);
        rollover.transition().duration(200).style('opacity', 0.9);
      })
      .on('mouseout', () => {
        rollover.transition().duration(500).style('opacity', 0);
      })
      .on('click', (d) => {
        if (onBubbleClick) {
          onBubbleClick(d);
        }
      });

    // add center labels
    bubbles.append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.centerTextColor ? `${d.centerTextColor} !important` : '')
      .attr('font-family', 'Lato, Helvetica, sans')
      .attr('font-size', '10px')
      .text(d => (d.centerText ? d.centerText : ''));
    // add top labels
    bubbles.append('text')
      .attr('x', d => d.x)
      .attr('y', d => (asPercentage ? d.y - options.maxBubbleRadius - 12 : d.y - d.scaledRadius - 12))
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.aboveTextColor ? `${d.aboveTextColor} !important` : '')
      .attr('font-family', 'Lato, Helvetica, sans')
      .attr('font-size', '10px')
      .text(d => (d.aboveText ? d.aboveText : ''));
    // add bottom labels
    bubbles.append('text')
      .attr('x', d => d.x)
      .attr('y', d => (asPercentage ? d.y + options.maxBubbleRadius + 20 : d.y + d.scaledRadius + 20))
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.belowTextColor ? `${d.belowTextColor} !important` : '')
      .attr('font-family', 'Lato, Helvetica, sans')
      .attr('font-size', '10spx')
      .text(d => (d.belowText ? d.belowText : ''));
  }
}

/**
 * Draw a bubble chart with labels.  Values are mapped to area, not radius.
 */
class BubbleRowChart extends React.Component {
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
    // otherwise there is data, so draw it
    return (
      <div className="bubble-row-chart-wrapper" ref={this.chartWrapperRef} />
    );
  }
}

BubbleRowChart.propTypes = {
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
  onBubbleClick: PropTypes.func,
  data: PropTypes.array.isRequired,
  domId: PropTypes.string.isRequired, // to make download work
  width: PropTypes.number,
  height: PropTypes.number,
  placement: PropTypes.string,
  maxBubbleRadius: PropTypes.number,
  minBubbleRadius: PropTypes.number,
  minCutoffValue: PropTypes.number,
  asPercentage: PropTypes.bool, // draw each circle as a pct of a larger one
  padding: PropTypes.number,
};

export default injectIntl(BubbleRowChart);
