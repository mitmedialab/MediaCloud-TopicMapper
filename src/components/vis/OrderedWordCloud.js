import PropTypes from 'prop-types';
import React from 'react';
import * as d3 from 'd3';
import { injectIntl, FormattedMessage } from 'react-intl';
import fontSizeComputer from '../../lib/visUtil';

const localMessages = {
  wordCloudCount: { id: 'wordcloud.rollover.count', defaultMessage: 'Uses: {count}' },
  wordCloudStem: { id: 'wordcloud.rollover.stem', defaultMessage: 'Stem: {stem}' },
  worldCloudTerm: { id: 'wordcloud.rollover.stem', defaultMessage: 'Term: {term}' },
  wordCloudError: { id: 'wordcloud.error', defaultMessage: 'Sorry, but there aren\'t enough words to render a useful word cloud.' },
  clickForDetails: { id: 'wordcloud.rollover.click', defaultMessage: 'Click word for details' },
};

const DEFAULT_WORD_COUNT = 100;
const DEFAULT_WIDTH = 530;
const DEFAULT_HEIGHT = 320;
const DEFAULT_MIN_FONT_SIZE = 10;
const DEFAULT_MAX_FONT_SIZE = 30;
const DEFAULT_TEXT_COLOR = '#333333';
const DEFAULT_LINK_COLOR = '#ff0000';

function listCloudLayout(wordNodes, width, extent, sizeRange) {
  const canvas = document.getElementById('canvas'); // TODO: replace with a con`stant
  const canvasContext2d = canvas.getContext('2d');
  let x = 0;
  if (typeof (wordNodes) === 'undefined') {
    return x;
  }
  wordNodes.attr('x', (d) => {
    const fs = fontSizeComputer(d, extent, sizeRange);
    canvasContext2d.font = `bold ${fs}px Lato`; // crazy hack for IE compat, instead of simply this.getComputedTextLength()
    const metrics = canvasContext2d.measureText(d.term);
    const textLength = metrics.width;
    let lastX = x;
    if (x + textLength + 10 > width) { // TODO: replace 10 with state property for padding
      lastX = 0;
    }
    x = lastX + textLength + (0.3 * fs);
    return lastX;
  });
  let y = -0.5 * sizeRange.max;
  let lastAdded = 0;
  wordNodes.attr('y', (d, index, data) => { // need closure here for d3.select to work right on the element
    const xPosition = d3.select(data[index]).attr('x');
    if (xPosition === '0') { // WTF does this come out as a string???!?!?!?!
      const height = 1.5 * fontSizeComputer(d, extent, sizeRange);
      y += height;
      lastAdded = height;
    }
    return y;
  });
  return y + lastAdded;
}

function drawViz(wrapperElement, {
  words, width, height, minFontSize, maxFontSize, textColor, onWordClick, linkColor, showTooltips,
  alreadyNormalized, fullExtent, domId, intl, selectedTerm,
}) {
  const { formatMessage, formatNumber } = intl;
  const options = {
    width: width || DEFAULT_WIDTH,
    height: height || DEFAULT_HEIGHT,
    maxFontSize: maxFontSize || DEFAULT_MAX_FONT_SIZE,
    minFontSize: minFontSize || DEFAULT_MIN_FONT_SIZE,
    textColor: textColor || DEFAULT_TEXT_COLOR,
    linkColor: linkColor || DEFAULT_LINK_COLOR,
    showTooltips: showTooltips || false,
    padding: 0,
    alreadyNormalized: alreadyNormalized || false,
    fullExtent,
    selectedTerm,
  };
  const data = [...words]; // so we can modify them for visualization
  // add in tf normalization
  const allSum = d3.sum(data, term => parseInt(term.count, 10));
  if (!options.alreadyNormalized) {
    data.forEach((term, idx) => { data[idx].tfnorm = term.count / allSum; });
  }
  // create a rollover tooltip helper
  const body = d3.select('body');
  let tooltipDiv = body.select('.viz-tooltip.ordered-word-cloud-tooltip');
  if (tooltipDiv.empty()) {
    tooltipDiv = body.append('div')
      .attr('class', 'viz-tooltip ordered-word-cloud-tooltip')
      .style('opacity', 0);
  }
  // start layout calculations
  const node = d3.select(wrapperElement)
    .html('') // important to empty it out first
    .append('svg:svg'); // then add in the SVG wrapper we will be rendering to;
  if (options.fullExtent === undefined) {
    options.fullExtent = d3.extent(data, d => d.tfnorm);
  }
  const innerWidth = options.width - (2 * options.padding);
  const svg = node
    .attr('height', options.height)
    .attr('width', options.width)
    .attr('id', domId)
    .attr('class', 'word-cloud');
  let y = options.height;
  const sizeRange = { min: options.minFontSize, max: options.maxFontSize };
  let wordNodes;
  const wordListHeight = options.height - (2 * options.padding);
  const wordWrapper = svg.append('g')
    .attr('transform', `translate(${2 * options.padding},0)`);

  while (y >= wordListHeight && sizeRange.max > sizeRange.min) {
    // Create words
    wordNodes = wordWrapper.selectAll('text')
      .data(data.slice(0, DEFAULT_WORD_COUNT), d => d.stem)
      .enter()
      .append('text') // for incoming data
      .attr('class', '')
      .attr('fill', options.textColor)
      .attr('font-family', 'Lato, Helvetica, sans')
      .classed('word', true)
      .classed('hide', d => d.display === false)
      .classed('show', d => d.display !== false)
      .classed('selected', d => d.term === selectedTerm)
      .attr('font-size', d => fontSizeComputer(d, options.fullExtent, sizeRange))
      .text(d => d.term)
      .attr('font-weight', 'bold')
      .on('mouseover', (d) => {
        const { event } = d3;
        d3.select(event.target).attr('fill', options.linkColor)
          .attr('cursor', 'pointer');
        if (options.showTooltips) {
          let tooltipHtml = formatMessage(localMessages.wordCloudStem, { stem: d.stem });
          tooltipHtml += '<br />';
          tooltipHtml += formatMessage(localMessages.worldCloudTerm, { term: d.term });
          tooltipHtml += '<br />';
          tooltipHtml += formatMessage(localMessages.wordCloudCount, { count: formatNumber(d.count) });
          tooltipHtml += '<br />';
          tooltipHtml += formatMessage(localMessages.clickForDetails);
          tooltipDiv.html(tooltipHtml);

          tooltipDiv.transition()
            .duration(200)
            .style('opacity', 0.9);
          tooltipDiv
            .style('position', 'absolute')
            .style('left', `${d3.event.pageX}px`)
            .style('top', `${d3.event.pageY - 48}px`);
        }
      })
      .on('mouseout', () => {
        const { event } = d3;
        d3.select(event.target).attr('fill', options.textColor)
          .attr('cursor', 'arrow');
        if (options.showTooltips) {
          tooltipDiv.transition()
            .duration(500)
            .style('opacity', 0);
        }
      })
      .on('click', (d) => {
        const { event } = d3;
        // d3.selectAll('text').classed('selected', false);
        if ((onWordClick !== null) && (onWordClick !== undefined)) {
          // d3.select(event.target).classed('selected', true);
          // d3.select(event.target).attr('fill', options.linkColor);
          onWordClick(d, d3.select(event.target));
        }
        return null;
      });

    // Layout
    y = 0;
    const leftHeight = listCloudLayout(wordNodes, innerWidth, options.fullExtent, sizeRange);
    y = Math.max(y, leftHeight);
    sizeRange.max -= 1;
  }
  if (y && y < options.height) {
    svg.attr('height', y);
  }
}


class OrderedWordCloud extends React.Component {
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
    const { words } = this.props;
    const maxWordFreq = words.length > 0 ? words[0].count : 0;
    const enoughDataToRender = (words.length > 10) && (maxWordFreq > 10);
    if (enoughDataToRender) {
      return (
        <div className="ordered-word-cloud" ref={this.chartWrapperRef} />
      );
    }
    return (<div><i><FormattedMessage {...localMessages.wordCloudError} /></i></div>);
  }
}

OrderedWordCloud.propTypes = {
  words: PropTypes.array.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  maxFontSize: PropTypes.number,
  minFontSize: PropTypes.number,
  textColor: PropTypes.string,
  onWordClick: PropTypes.func,
  linkColor: PropTypes.string,
  showTooltips: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  alreadyNormalized: PropTypes.bool,
  fullExtent: PropTypes.array,
  domId: PropTypes.string,
  selectedTerm: PropTypes.string,
};

export default injectIntl(OrderedWordCloud);
